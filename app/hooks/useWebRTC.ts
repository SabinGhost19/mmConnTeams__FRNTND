// File: useWebRTC.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  doc,
  collection,
  addDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/app/services/firebase/firebase";

// Types
export interface Participant {
  id: string;
  userName: string;
  isHost: boolean;
  joinedAt?: Date | { toDate: () => Date };
  streamActive?: boolean;
}

export interface WebRTCHookReturn {
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  roomId: string | null;
  participants: Participant[];
  isHost: boolean;
  initializeMedia: (
    video: boolean,
    audio: boolean,
    deviceIds?: { videoId?: string; audioId?: string }
  ) => Promise<boolean>;
  createRoom: (userName: string) => Promise<string>;
  joinRoom: (roomId: string, userName: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  toggleTrack: (kind: "audio" | "video", enabled: boolean) => void;
}

// ICE servers configuration
const iceServers = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
    {
      urls: [
        "turn:numb.viagenie.ca",
        "turn:numb.viagenie.ca:3478?transport=udp",
        "turn:numb.viagenie.ca:3478?transport=tcp",
      ],
      credential: "muazkh",
      username: "webrtc@live.com",
    },
    {
      urls: [
        "turn:turn.bistri.com:80",
        "turn:turn.bistri.com:80?transport=tcp",
      ],
      username: "homeo",
      credential: "homeo",
    },
    {
      urls: [
        "turn:turn.anyfirewall.com:443?transport=tcp",
        "turn:turn.anyfirewall.com:443",
      ],
      username: "webrtc",
      credential: "webrtc",
    },
  ],
  iceCandidatePoolSize: 10,
};

// Helper class to manage peer connections and ICE candidates
class PeerConnectionManager {
  private pc: RTCPeerConnection;
  private pendingCandidates: RTCIceCandidate[] = [];
  private hasRemoteDescription = false;

  constructor(private peerId: string) {
    this.pc = new RTCPeerConnection(iceServers);

    // Add signaling state change handler
    this.pc.addEventListener("signalingstatechange", () => {
      if (this.pc.signalingState === "stable") {
        this.hasRemoteDescription = true;
        this.processPendingCandidates();
      }
    });
  }

  get peerConnection(): RTCPeerConnection {
    return this.pc;
  }

  async setRemoteDescription(desc: RTCSessionDescriptionInit): Promise<void> {
    await this.pc.setRemoteDescription(new RTCSessionDescription(desc));
    this.hasRemoteDescription = true;
    await this.processPendingCandidates();
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (this.hasRemoteDescription && this.pc.remoteDescription) {
      try {
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn(`Error adding ICE candidate for ${this.peerId}:`, err);
      }
    } else {
      // Store candidate for later
      this.pendingCandidates.push(new RTCIceCandidate(candidate));
      console.log(
        `Stored pending candidate for ${this.peerId}. Total: ${this.pendingCandidates.length}`
      );
    }
  }

  private async processPendingCandidates(): Promise<void> {
    if (this.pendingCandidates.length === 0) return;

    console.log(
      `Processing ${this.pendingCandidates.length} pending candidates for ${this.peerId}`
    );

    const candidates = [...this.pendingCandidates];
    this.pendingCandidates = [];

    for (const candidate of candidates) {
      try {
        await this.pc.addIceCandidate(candidate);
      } catch (err) {
        console.warn(
          `Error adding pending ICE candidate for ${this.peerId}:`,
          err
        );
      }
    }
  }

  close(): void {
    this.pc.close();
    this.pendingCandidates = [];
  }
}

// Keep track of peer connection managers
const peerManagersRef = useRef<Record<string, PeerConnectionManager>>({});

// Helper to get or create a peer connection manager
const getPeerManager = (peerId: string): PeerConnectionManager => {
  if (!peerManagersRef.current[peerId]) {
    peerManagersRef.current[peerId] = new PeerConnectionManager(peerId);
  }
  return peerManagersRef.current[peerId];
};

const useWebRTC = (): WebRTCHookReturn => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<
    Record<string, MediaStream>
  >({});
  const [roomId, setRoomId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");

  // Refs
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const unsubscribersRef = useRef<(() => void)[]>([]);
  const isLeavingRef = useRef<boolean>(false);

  // Map to store candidates that arrive before remote description is set
  const pendingIceCandidates = new Map<string, RTCIceCandidate[]>();

  // Process a received ICE candidate
  const processIceCandidate = async (
    peerId: string,
    candidate: RTCIceCandidateInit
  ) => {
    const pc = peerConnections.current[peerId];
    if (!pc) return;

    try {
      // If we have a remote description, try to add the candidate
      if (pc.remoteDescription && pc.signalingState === "stable") {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log(`Added ICE candidate for ${peerId}`);
        } catch (error) {
          console.warn(`Error adding ICE candidate: ${error}`);
        }
      } else {
        // Store the candidate until we have a remote description
        if (!pendingIceCandidates.has(peerId)) {
          pendingIceCandidates.set(peerId, []);
        }
        pendingIceCandidates.get(peerId)!.push(new RTCIceCandidate(candidate));
        console.log(
          `Stored ICE candidate for ${peerId}. Now have ${
            pendingIceCandidates.get(peerId)!.length
          } pending`
        );
      }
    } catch (error) {
      console.error(`Error processing ICE candidate for ${peerId}:`, error);
    }
  };

  // Apply pending ICE candidates after remote description is set
  const applyPendingIceCandidates = async (peerId: string) => {
    const pc = peerConnections.current[peerId];
    const candidates = pendingIceCandidates.get(peerId) || [];

    if (candidates.length === 0 || !pc || !pc.remoteDescription) return;

    console.log(
      `Applying ${candidates.length} pending ICE candidates for ${peerId}`
    );

    for (const candidate of candidates) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (error) {
        console.warn(`Error applying pending ICE candidate: ${error}`);
      }
    }

    // Clear pending candidates for this peer
    pendingIceCandidates.set(peerId, []);
  };

  // Set up ice candidate handling for a peer connection
  const setupIceCandidateHandling = (pc: RTCPeerConnection, peerId: string) => {
    // Listen for signaling state changes to apply pending candidates
    pc.addEventListener("signalingstatechange", () => {
      if (pc.signalingState === "stable") {
        applyPendingIceCandidates(peerId);
      }
    });

    return pc;
  };

  // Cleanup function
  const cleanup = useCallback(() => {
    // Stop all tracks in local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Close all peer connections and managers
    Object.values(peerConnections.current).forEach((pc) => {
      pc.close();
    });
    peerConnections.current = {};

    // Close all peer managers
    Object.values(peerManagersRef.current).forEach((manager) => {
      manager.close();
    });
    peerManagersRef.current = {};

    // Clear remote streams
    setRemoteStreams({});

    // Unsubscribe from all Firebase listeners
    unsubscribersRef.current.forEach((unsubscribe) => unsubscribe());
    unsubscribersRef.current = [];

    // Reset state
    setLocalStream(null);
    setRoomId(null);
    setParticipants([]);
    setIsHost(false);
    setUserId("");
  }, []);

  // Initialize media devices
  const initializeMedia = useCallback(
    async (
      video: boolean,
      audio: boolean,
      deviceIds?: { videoId?: string; audioId?: string }
    ): Promise<boolean> => {
      try {
        // Stop existing tracks
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => track.stop());
        }

        // Configure video constraints
        const videoConstraints = video
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { min: 15, ideal: 30 },
              ...(deviceIds?.videoId
                ? { deviceId: { ideal: deviceIds.videoId } }
                : {}),
            }
          : false;

        // Configure audio constraints
        const audioConstraints = audio
          ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              ...(deviceIds?.audioId
                ? { deviceId: { ideal: deviceIds.audioId } }
                : {}),
            }
          : false;

        // Try to get the requested stream
        let stream: MediaStream | null = null;
        let isAudioOnly = false;

        try {
          // First try with all constraints
          stream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: audioConstraints,
          });
        } catch (error) {
          // If getting both video and audio fails, try fallback options
          console.error("Initial media access failed:", error);

          if (error instanceof DOMException) {
            // Handle different types of errors
            if (
              error.name === "NotReadableError" ||
              error.name === "AbortError"
            ) {
              console.warn(
                "Device might be in use by another browser. Trying alternatives..."
              );

              if (video && audio) {
                // First try with no specific device ID for video (might pick a different camera)
                try {
                  const genericConstraints = {
                    video: {
                      width: { ideal: 1280 },
                      height: { ideal: 720 },
                      frameRate: { min: 15, ideal: 30 },
                    },
                    audio: audioConstraints,
                  };

                  stream = await navigator.mediaDevices.getUserMedia(
                    genericConstraints
                  );
                  console.log(
                    "Successfully connected with generic video constraints"
                  );
                  return false; // Not audio-only
                } catch (genericError) {
                  console.warn(
                    "Generic video constraints failed, trying audio only"
                  );
                }

                // If that fails, try audio only
                try {
                  stream = await navigator.mediaDevices.getUserMedia({
                    video: false,
                    audio: audioConstraints,
                  });

                  isAudioOnly = true;
                  console.log("Successfully connected with audio only");
                } catch (audioError) {
                  console.error("Audio-only fallback failed:", audioError);

                  if (audioError instanceof DOMException) {
                    if (audioError.name === "NotAllowedError") {
                      throw new Error(
                        "Microphone access denied. Please allow microphone access to continue."
                      );
                    } else if (audioError.name === "NotFoundError") {
                      throw new Error(
                        "No microphone found. Please connect a microphone and try again."
                      );
                    }
                  }

                  // Last resort - try with minimal constraints
                  try {
                    stream = await navigator.mediaDevices.getUserMedia({
                      audio: true,
                      video: false,
                    });
                    isAudioOnly = true;
                    console.log(
                      "Successfully connected with minimal audio constraints"
                    );
                  } catch (minimalError) {
                    // If this fails too, we really can't proceed
                    throw error; // Throw the original error
                  }
                }
              }
            } else if (error.name === "NotAllowedError") {
              throw new Error(
                "Camera and microphone access denied. Please allow access to continue."
              );
            } else if (error.name === "NotFoundError") {
              throw new Error(
                "No camera or microphone found. Please connect devices and try again."
              );
            }
          } else {
            // For other types of errors, re-throw
            throw error;
          }
        }

        // Save and expose stream
        if (stream) {
          localStreamRef.current = stream;
          setLocalStream(stream);

          // Update tracks in existing peer connections
          Object.entries(peerConnections.current).forEach(([peerId, pc]) => {
            // Remove old tracks
            const senders = pc.getSenders();
            senders.forEach((sender) => {
              pc.removeTrack(sender);
            });

            // Add new tracks
            stream!.getTracks().forEach((track) => {
              pc.addTrack(track, stream!);
            });
          });

          // Return information about whether we're in audio-only mode
          return isAudioOnly;
        } else {
          throw new Error("Failed to initialize media");
        }
      } catch (error) {
        console.error("Error initializing media:", error);
        throw error;
      }
    },
    []
  );

  // Create and send offer
  const createAndSendOffer = useCallback(
    async (pc: RTCPeerConnection, peerId: string) => {
      try {
        if (pc.signalingState === "have-local-offer") {
          console.log(`Already negotiating with ${peerId}, skipping`);
          return;
        }

        // Improve ICE connectivity with these options
        const offerOptions = {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
          iceRestart: true,
        };

        const offer = await pc.createOffer(offerOptions);
        await pc.setLocalDescription(offer);

        if (pc.localDescription && roomId && !isLeavingRef.current) {
          const offerRef = collection(db, "rooms", roomId, "offers");
          await addDoc(offerRef, {
            sender: userId,
            receiver: peerId,
            sdp: JSON.stringify(pc.localDescription),
            timestamp: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error(`Error creating offer for ${peerId}:`, error);
      }
    },
    [roomId, userId]
  );

  // Add this function to monitor ICE connection state
  const setupICEConnectionStateMonitoring = (
    pc: RTCPeerConnection,
    peerId: string
  ) => {
    pc.oniceconnectionstatechange = () => {
      console.log(
        `ICE connection state with ${peerId}: ${pc.iceConnectionState}`
      );

      if (pc.iceConnectionState === "failed") {
        // Try to restart ICE when it fails
        console.log(`ICE connection failed for ${peerId}, attempting restart`);
        createAndSendOffer(pc, peerId).catch((err) => {
          console.error(`Failed to restart ICE for ${peerId}:`, err);
        });
      }
    };
  };

  // Store candidates to apply after remote description is set
  const setupCandidateHandler = (
    pc: RTCPeerConnection,
    peerId: string,
    roomId: string,
    userId: string
  ) => {
    // We'll store candidates that arrive before the remote description is set
    const pendingCandidates: RTCIceCandidate[] = [];

    // Function to add pending candidates
    const addPendingCandidates = async () => {
      if (pendingCandidates.length === 0) return;

      // Add any pending candidates now that we have a remote description
      try {
        console.log(
          `Adding ${pendingCandidates.length} pending candidates for ${peerId}`
        );
        for (const candidate of pendingCandidates) {
          await pc.addIceCandidate(candidate).catch((err) => {
            console.warn(`Error adding pending ICE candidate: ${err.message}`);
          });
        }
        pendingCandidates.length = 0; // Clear the array
      } catch (error) {
        console.error(`Error adding pending candidates: ${error}`);
      }
    };

    // Listen for remote description changes to add pending candidates
    pc.addEventListener("signalingstatechange", () => {
      if (pc.signalingState === "stable" && pendingCandidates.length > 0) {
        addPendingCandidates();
      }
    });

    // Handle incoming candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && roomId && !isLeavingRef.current) {
        const candidateRef = collection(db, "rooms", roomId, "candidates");
        addDoc(candidateRef, {
          sender: userId,
          receiver: peerId,
          candidate: JSON.stringify(event.candidate),
          timestamp: serverTimestamp(),
        }).catch((err) => console.error("Error adding ICE candidate:", err));
      }
    };

    // Return a function to process an incoming candidate
    return async (candidate: RTCIceCandidateInit) => {
      const iceCandidate = new RTCIceCandidate(candidate);

      // If we have a remote description, add the candidate immediately
      if (pc.remoteDescription && pc.signalingState === "stable") {
        try {
          await pc.addIceCandidate(iceCandidate);
        } catch (error) {
          console.error(`Error adding ICE candidate for ${peerId}:`, error);
        }
      } else {
        // Otherwise, store it to add later
        pendingCandidates.push(iceCandidate);
        console.log(
          `Storing ICE candidate for ${peerId} until remote description is set. Now have ${pendingCandidates.length} pending`
        );
      }
    };
  };

  // Create a new room
  const createRoom = useCallback(async (userName: string): Promise<string> => {
    try {
      // Generate a unique room ID
      const newRoomId = Math.random().toString(36).substring(2, 10);

      // Generate a unique user ID
      const newUserId = Math.random().toString(36).substring(2, 10);
      setUserId(newUserId);

      // Create room document
      const roomRef = doc(db, "rooms", newRoomId);
      await setDoc(roomRef, {
        createdAt: serverTimestamp(),
        createdBy: newUserId,
        active: true,
      });

      // Add host as first participant
      const participantRef = doc(
        db,
        "rooms",
        newRoomId,
        "participants",
        newUserId
      );
      await setDoc(participantRef, {
        id: newUserId,
        userName,
        isHost: true,
        joinedAt: serverTimestamp(),
        streamActive: true,
      });

      // Set up listeners for participants
      const participantsQuery = query(
        collection(db, "rooms", newRoomId, "participants")
      );

      const unsubscribe = onSnapshot(participantsQuery, (snapshot) => {
        const updatedParticipants: Participant[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data() as Participant;
          updatedParticipants.push(data);
        });

        setParticipants(updatedParticipants);
      });

      unsubscribersRef.current.push(unsubscribe);

      // Set up listeners for offers
      const offersQuery = query(
        collection(db, "rooms", newRoomId, "offers"),
        where("receiver", "==", newUserId)
      );

      const unsubscribeOffers = onSnapshot(offersQuery, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            const senderId = data.sender;

            // Get or create peer manager
            const peerManager = getPeerManager(senderId);
            const pc = peerManager.peerConnection;

            // Store in the old reference for compatibility
            peerConnections.current[senderId] = pc;

            // Set up event handlers if this is a new connection
            if (!pc.ontrack) {
              // Handle ICE candidates
              pc.onicecandidate = (event) => {
                if (event.candidate && newRoomId && !isLeavingRef.current) {
                  const candidateRef = collection(
                    db,
                    "rooms",
                    newRoomId,
                    "candidates"
                  );
                  addDoc(candidateRef, {
                    sender: newUserId,
                    receiver: senderId,
                    candidate: JSON.stringify(event.candidate),
                    timestamp: serverTimestamp(),
                  }).catch((err) =>
                    console.error("Error adding ICE candidate:", err)
                  );
                }
              };

              // Handle incoming tracks
              pc.ontrack = (event) => {
                console.log(
                  `Received track from ${senderId}:`,
                  event.track.kind
                );

                setRemoteStreams((prev) => {
                  if (
                    prev[senderId] &&
                    event.streams[0] &&
                    prev[senderId].id === event.streams[0].id
                  ) {
                    return prev;
                  }

                  return {
                    ...prev,
                    [senderId]: event.streams[0],
                  };
                });

                event.track.onended = () => {
                  console.log(
                    `Track ${event.track.kind} from ${senderId} ended`
                  );
                };
              };

              // Monitor ICE connection state
              setupICEConnectionStateMonitoring(pc, senderId);

              // Add local tracks
              if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => {
                  pc.addTrack(track, localStreamRef.current!);
                });
              }
            }

            // Process the offer
            try {
              const sdp = JSON.parse(data.sdp);
              await peerManager.setRemoteDescription(sdp);

              // Create and send answer
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);

              const answerRef = collection(db, "rooms", newRoomId, "answers");
              await addDoc(answerRef, {
                sender: newUserId,
                receiver: senderId,
                sdp: JSON.stringify(pc.localDescription),
                timestamp: serverTimestamp(),
              });
            } catch (error) {
              console.error("Error processing offer:", error);
            }
          }
        });
      });

      unsubscribersRef.current.push(unsubscribeOffers);

      // Set up listeners for answers
      const answersQuery = query(
        collection(db, "rooms", newRoomId, "answers"),
        where("receiver", "==", newUserId)
      );

      const unsubscribeAnswers = onSnapshot(answersQuery, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            const senderId = data.sender;

            const peerManager = peerManagersRef.current[senderId];
            if (peerManager) {
              try {
                const sdp = JSON.parse(data.sdp);
                await peerManager.setRemoteDescription(sdp);
                console.log(
                  `Successfully set remote description from ${senderId}`
                );
              } catch (error) {
                console.error(
                  `Error setting remote description from ${senderId}:`,
                  error
                );
              }
            }
          }
        });
      });

      unsubscribersRef.current.push(unsubscribeAnswers);

      // Set up listeners for ICE candidates
      const candidatesQuery = query(
        collection(db, "rooms", newRoomId, "candidates"),
        where("receiver", "==", newUserId)
      );

      const unsubscribeCandidates = onSnapshot(candidatesQuery, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            const senderId = data.sender;

            const peerManager = peerManagersRef.current[senderId];
            if (peerManager) {
              try {
                const candidateInit = JSON.parse(data.candidate);
                await peerManager.addIceCandidate(candidateInit);
              } catch (error) {
                console.error(
                  `Error processing ICE candidate from ${senderId}:`,
                  error
                );
              }
            } else {
              console.warn(
                `No peer manager for ${senderId} to handle ICE candidate`
              );
            }
          }
        });
      });

      unsubscribersRef.current.push(unsubscribeCandidates);

      // Update state
      setRoomId(newRoomId);
      setIsHost(true);

      return newRoomId;
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  }, []);

  // Join an existing room
  const joinRoom = useCallback(
    async (roomId: string, userName: string): Promise<void> => {
      try {
        // Check if room exists
        const roomRef = doc(db, "rooms", roomId);
        const roomDoc = await getDoc(roomRef);

        if (!roomDoc.exists()) {
          throw new Error("Room does not exist");
        }

        // Generate a unique user ID
        const newUserId = Math.random().toString(36).substring(2, 10);
        setUserId(newUserId);

        // Add user as participant
        const participantRef = doc(
          db,
          "rooms",
          roomId,
          "participants",
          newUserId
        );
        await setDoc(participantRef, {
          id: newUserId,
          userName,
          isHost: false,
          joinedAt: serverTimestamp(),
          streamActive: true,
        });

        // Set up listeners for participants
        const participantsQuery = query(
          collection(db, "rooms", roomId, "participants")
        );

        const unsubscribe = onSnapshot(participantsQuery, (snapshot) => {
          const updatedParticipants: Participant[] = [];

          snapshot.forEach((doc) => {
            const data = doc.data() as Participant;
            updatedParticipants.push(data);
          });

          setParticipants(updatedParticipants);
        });

        unsubscribersRef.current.push(unsubscribe);

        // Set up listeners for offers
        const offersQuery = query(
          collection(db, "rooms", roomId, "offers"),
          where("receiver", "==", newUserId)
        );

        const unsubscribeOffers = onSnapshot(offersQuery, (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === "added") {
              const data = change.doc.data();
              const senderId = data.sender;

              // Get or create peer manager
              const peerManager = getPeerManager(senderId);
              const pc = peerManager.peerConnection;

              // Store in the old reference for compatibility
              peerConnections.current[senderId] = pc;

              // Set up event handlers if this is a new connection
              if (!pc.ontrack) {
                // Handle ICE candidates
                pc.onicecandidate = (event) => {
                  if (event.candidate && roomId && !isLeavingRef.current) {
                    const candidateRef = collection(
                      db,
                      "rooms",
                      roomId,
                      "candidates"
                    );
                    addDoc(candidateRef, {
                      sender: newUserId,
                      receiver: senderId,
                      candidate: JSON.stringify(event.candidate),
                      timestamp: serverTimestamp(),
                    }).catch((err) =>
                      console.error("Error adding ICE candidate:", err)
                    );
                  }
                };

                // Handle incoming tracks
                pc.ontrack = (event) => {
                  console.log(
                    `Received track from ${senderId}:`,
                    event.track.kind
                  );

                  setRemoteStreams((prev) => {
                    if (
                      prev[senderId] &&
                      event.streams[0] &&
                      prev[senderId].id === event.streams[0].id
                    ) {
                      return prev;
                    }

                    return {
                      ...prev,
                      [senderId]: event.streams[0],
                    };
                  });

                  event.track.onended = () => {
                    console.log(
                      `Track ${event.track.kind} from ${senderId} ended`
                    );
                  };
                };

                // Monitor ICE connection state
                setupICEConnectionStateMonitoring(pc, senderId);

                // Add local tracks
                if (localStreamRef.current) {
                  localStreamRef.current.getTracks().forEach((track) => {
                    pc.addTrack(track, localStreamRef.current!);
                  });
                }
              }

              // Process the offer
              try {
                const sdp = JSON.parse(data.sdp);
                await peerManager.setRemoteDescription(sdp);

                // Create and send answer
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                const answerRef = collection(db, "rooms", roomId, "answers");
                await addDoc(answerRef, {
                  sender: newUserId,
                  receiver: senderId,
                  sdp: JSON.stringify(pc.localDescription),
                  timestamp: serverTimestamp(),
                });
              } catch (error) {
                console.error("Error processing offer:", error);
              }
            }
          });
        });

        unsubscribersRef.current.push(unsubscribeOffers);

        // Set up listeners for answers
        const answersQuery = query(
          collection(db, "rooms", roomId, "answers"),
          where("receiver", "==", newUserId)
        );

        const unsubscribeAnswers = onSnapshot(answersQuery, (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === "added") {
              const data = change.doc.data();
              const senderId = data.sender;

              const peerManager = peerManagersRef.current[senderId];
              if (peerManager) {
                try {
                  const sdp = JSON.parse(data.sdp);
                  await peerManager.setRemoteDescription(sdp);
                  console.log(
                    `Successfully set remote description from ${senderId}`
                  );
                } catch (error) {
                  console.error(
                    `Error setting remote description from ${senderId}:`,
                    error
                  );
                }
              }
            }
          });
        });

        unsubscribersRef.current.push(unsubscribeAnswers);

        // Set up listeners for ICE candidates
        const candidatesQuery = query(
          collection(db, "rooms", roomId, "candidates"),
          where("receiver", "==", newUserId)
        );

        const unsubscribeCandidates = onSnapshot(
          candidatesQuery,
          (snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
              if (change.type === "added") {
                const data = change.doc.data();
                const senderId = data.sender;

                const peerManager = peerManagersRef.current[senderId];
                if (peerManager) {
                  try {
                    const candidateInit = JSON.parse(data.candidate);
                    await peerManager.addIceCandidate(candidateInit);
                  } catch (error) {
                    console.error(
                      `Error processing ICE candidate from ${senderId}:`,
                      error
                    );
                  }
                } else {
                  console.warn(
                    `No peer manager for ${senderId} to handle ICE candidate`
                  );
                }
              }
            });
          }
        );

        unsubscribersRef.current.push(unsubscribeCandidates);

        // Connect to existing participants
        const existingParticipants = participants.filter(
          (p) => p.id !== newUserId
        );

        for (const participant of existingParticipants) {
          const peerManager = getPeerManager(participant.id);
          const pc = peerManager.peerConnection;

          // Store in the old reference for compatibility
          peerConnections.current[participant.id] = pc;

          // Set up event handlers
          pc.onicecandidate = (event) => {
            if (event.candidate && roomId && !isLeavingRef.current) {
              const candidateRef = collection(
                db,
                "rooms",
                roomId,
                "candidates"
              );
              addDoc(candidateRef, {
                sender: newUserId,
                receiver: participant.id,
                candidate: JSON.stringify(event.candidate),
                timestamp: serverTimestamp(),
              }).catch((err) =>
                console.error("Error adding ICE candidate:", err)
              );
            }
          };

          pc.ontrack = (event) => {
            setRemoteStreams((prev) => ({
              ...prev,
              [participant.id]: event.streams[0],
            }));
          };

          // Add monitoring for ICE connection state
          setupICEConnectionStateMonitoring(pc, participant.id);

          // Add local tracks
          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
              pc.addTrack(track, localStreamRef.current!);
            });
          }

          // Create and send offer
          await createAndSendOffer(pc, participant.id);
        }

        // Update state
        setRoomId(roomId);
        setIsHost(false);
      } catch (error) {
        console.error("Error joining room:", error);
        throw error;
      }
    },
    [participants, createAndSendOffer]
  );

  // Leave the current room
  const leaveRoom = useCallback(async (): Promise<void> => {
    try {
      isLeavingRef.current = true;

      if (roomId && userId) {
        // Remove participant from room
        const participantRef = doc(db, "rooms", roomId, "participants", userId);
        await deleteDoc(participantRef);

        // Check if room is empty
        const participantsQuery = query(
          collection(db, "rooms", roomId, "participants")
        );
        const participantsSnapshot = await getDocs(participantsQuery);

        if (participantsSnapshot.empty) {
          // Delete room if empty
          const roomRef = doc(db, "rooms", roomId);
          await deleteDoc(roomRef);
        }
      }

      // Clean up
      cleanup();
    } catch (error) {
      console.error("Error leaving room:", error);
      throw error;
    } finally {
      isLeavingRef.current = false;
    }
  }, [roomId, userId, cleanup]);

  // Toggle audio/video track
  const toggleTrack = useCallback(
    (kind: "audio" | "video", enabled: boolean): void => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          if (track.kind === kind) {
            track.enabled = enabled;
          }
        });
      }
    },
    []
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    localStream,
    remoteStreams,
    roomId,
    participants,
    isHost,
    initializeMedia,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleTrack,
  };
};

export default useWebRTC;
