"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

// WebRTC configuration (turn/stun servers)
const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
    // You can add TURN servers here if needed for NAT traversal
    // {
    //   urls: ['turn:your-turn-server.com:3478'],
    //   username: 'username',
    //   credential: 'credential'
    // }
  ],
  iceCandidatePoolSize: 10,
};

export function useWebRTC() {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [roomId, setRoomId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const peerConnections = useRef({});

  // Initialize media stream
  const initializeMedia = async (
    videoEnabled = true,
    audioEnabled = true,
    selectedCamera = null,
    selectedMicrophone = null
  ) => {
    try {
      // Build constraints based on selected devices and enabled state
      const constraints = {
        video: videoEnabled
          ? selectedCamera
            ? { deviceId: { exact: selectedCamera } }
            : true
          : false,
        audio: audioEnabled
          ? selectedMicrophone
            ? { deviceId: { exact: selectedMicrophone } }
            : true
          : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw error;
    }
  };

  // Create a new room
  const createRoom = async (userName) => {
    try {
      // Create a new room document with metadata
      const roomRef = await addDoc(collection(db, "rooms"), {
        createdAt: new Date(),
        createdBy: userName,
        active: true,
      });

      const roomId = roomRef.id;

      // Add the host to participants collection
      await addDoc(collection(db, "rooms", roomId, "participants"), {
        userName: userName,
        joinedAt: new Date(),
        isHost: true,
        peerId: "host",
      });

      setRoomId(roomId);
      setIsHost(true);

      // Listen for new participants
      setupParticipantListener(roomId);

      return roomId;
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  };

  // Join an existing room
  const joinRoom = async (roomId, userName) => {
    try {
      // Check if room exists
      const roomRef = doc(db, "rooms", roomId);
      const roomSnapshot = await getDoc(roomRef);

      if (!roomSnapshot.exists() || !roomSnapshot.data().active) {
        throw new Error("Room doesn't exist or is no longer active");
      }

      // Generate a unique peerId
      const peerId = `peer_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      // Add participant to the room
      await addDoc(collection(db, "rooms", roomId, "participants"), {
        userName: userName,
        joinedAt: new Date(),
        isHost: false,
        peerId: peerId,
      });

      setRoomId(roomId);

      // Listen for other participants and set up connections
      setupParticipantListener(roomId);

      // Set up listener for offers
      setupOfferListener(roomId, peerId);

      return roomId;
    } catch (error) {
      console.error("Error joining room:", error);
      throw error;
    }
  };

  // Setup participant listener
  const setupParticipantListener = (roomId) => {
    const participantsRef = collection(db, "rooms", roomId, "participants");

    onSnapshot(participantsRef, (snapshot) => {
      const participantsList = [];

      snapshot.forEach((doc) => {
        const participant = {
          id: doc.id,
          ...doc.data(),
        };

        participantsList.push(participant);

        // If we're the host, and this is a new non-host participant, create an offer
        if (
          isHost &&
          participant.peerId !== "host" &&
          !peerConnections.current[participant.peerId]
        ) {
          createOffer(roomId, participant.peerId);
        }
      });

      setParticipants(participantsList);
    });
  };

  // Setup offer listener (for non-host participants)
  const setupOfferListener = (roomId, peerId) => {
    const offersRef = collection(db, "rooms", roomId, "offers");
    const q = query(offersRef, where("targetPeerId", "==", peerId));

    onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          handleOffer(roomId, data, change.doc.id);
        }
      });
    });
  };

  // Create WebRTC offer (host to participant)
  const createOffer = async (roomId, targetPeerId) => {
    try {
      // Create a new RTCPeerConnection
      const peerConnection = new RTCPeerConnection(servers);
      peerConnections.current[targetPeerId] = peerConnection;

      // Add local tracks to the connection
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // Store ICE candidate in Firebase
          addDoc(
            collection(
              db,
              "rooms",
              roomId,
              "offers",
              peerConnection.offerId,
              "iceCandidates"
            ),
            event.candidate.toJSON()
          );
        }
      };

      // Handle remote tracks
      peerConnection.ontrack = (event) => {
        // Create a new remote stream
        const remoteStream = new MediaStream();
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });

        // Update remote streams
        setRemoteStreams((prev) => ({
          ...prev,
          [targetPeerId]: remoteStream,
        }));
      };

      // Create offer
      const offerDescription = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offerDescription);

      // Store offer in Firebase
      const offerRef = await addDoc(collection(db, "rooms", roomId, "offers"), {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
        fromPeerId: "host",
        targetPeerId: targetPeerId,
        created: new Date(),
      });

      // Store offerId for future reference with ICE candidates
      peerConnection.offerId = offerRef.id;

      // Listen for answer
      onSnapshot(
        doc(db, "rooms", roomId, "offers", offerRef.id),
        (snapshot) => {
          const data = snapshot.data();
          if (data?.answer) {
            const answerDescription = new RTCSessionDescription({
              sdp: data.answer.sdp,
              type: data.answer.type,
            });

            if (peerConnection.currentRemoteDescription === null) {
              peerConnection.setRemoteDescription(answerDescription);
            }
          }
        }
      );

      // Listen for ICE candidates from the other peer
      onSnapshot(
        collection(
          db,
          "rooms",
          roomId,
          "offers",
          offerRef.id,
          "answerCandidates"
        ),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const candidate = new RTCIceCandidate(change.doc.data());
              peerConnection.addIceCandidate(candidate);
            }
          });
        }
      );
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  // Handle incoming offer (for non-host participants)
  const handleOffer = async (roomId, offerData, offerId) => {
    try {
      // Create a new RTCPeerConnection
      const peerConnection = new RTCPeerConnection(servers);
      peerConnections.current[offerData.fromPeerId] = peerConnection;

      // Add local tracks to the connection
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // Store ICE candidate in Firebase
          addDoc(
            collection(
              db,
              "rooms",
              roomId,
              "offers",
              offerId,
              "answerCandidates"
            ),
            event.candidate.toJSON()
          );
        }
      };

      // Handle remote tracks
      peerConnection.ontrack = (event) => {
        // Create a new remote stream
        const remoteStream = new MediaStream();
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });

        // Update remote streams
        setRemoteStreams((prev) => ({
          ...prev,
          [offerData.fromPeerId]: remoteStream,
        }));
      };

      // Set remote description from offer
      const offerDescription = new RTCSessionDescription({
        sdp: offerData.sdp,
        type: offerData.type,
      });

      await peerConnection.setRemoteDescription(offerDescription);

      // Create answer
      const answerDescription = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answerDescription);

      // Store answer in Firebase
      await updateDoc(doc(db, "rooms", roomId, "offers", offerId), {
        answer: {
          type: answerDescription.type,
          sdp: answerDescription.sdp,
        },
      });

      // Listen for ICE candidates from the other peer
      onSnapshot(
        collection(db, "rooms", roomId, "offers", offerId, "iceCandidates"),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const candidate = new RTCIceCandidate(change.doc.data());
              peerConnection.addIceCandidate(candidate);
            }
          });
        }
      );
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  // Leave room
  const leaveRoom = async () => {
    try {
      // Close all peer connections
      Object.values(peerConnections.current).forEach((connection) => {
        connection.close();
      });

      // Stop local stream tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      // Find and remove participant document
      if (roomId) {
        const participantsRef = collection(db, "rooms", roomId, "participants");
        const q = isHost
          ? query(participantsRef, where("isHost", "==", true))
          : query(participantsRef, where("peerId", "!=", "host"));

        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(async (document) => {
          await deleteDoc(
            doc(db, "rooms", roomId, "participants", document.id)
          );
        });

        // If host is leaving, mark room as inactive
        if (isHost) {
          await updateDoc(doc(db, "rooms", roomId), {
            active: false,
          });
        }
      }

      // Reset state
      setRoomId(null);
      setRemoteStreams({});
      setParticipants([]);
      setIsHost(false);
      peerConnections.current = {};
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      // Close all peer connections
      Object.values(peerConnections.current).forEach((connection) => {
        connection.close();
      });

      // Stop local stream tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [localStream]);

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
  };
}
