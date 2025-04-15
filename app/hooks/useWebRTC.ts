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
      this.pendingCandidates.push(new RTCIceCandidate(candidate));
    }
  }

  private async processPendingCandidates(): Promise<void> {
    if (this.pendingCandidates.length === 0) return;

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
  const peerManagersRef = useRef<Record<string, PeerConnectionManager>>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const unsubscribersRef = useRef<(() => void)[]>([]);
  const isLeavingRef = useRef<boolean>(false);

  // Helper to get or create a peer connection manager
  const getPeerManager = useCallback(
    (peerId: string): PeerConnectionManager => {
      if (!peerManagersRef.current[peerId]) {
        peerManagersRef.current[peerId] = new PeerConnectionManager(peerId);
      }
      return peerManagersRef.current[peerId];
    },
    []
  );

  // Initialize media
  const initializeMedia = useCallback(
    async (
      video: boolean,
      audio: boolean,
      deviceIds?: { videoId?: string; audioId?: string }
    ): Promise<boolean> => {
      try {
        const constraints: MediaStreamConstraints = {
          video: video
            ? {
                deviceId: deviceIds?.videoId
                  ? { exact: deviceIds.videoId }
                  : undefined,
              }
            : false,
          audio: audio
            ? {
                deviceId: deviceIds?.audioId
                  ? { exact: deviceIds.audioId }
                  : undefined,
              }
            : false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setLocalStream(stream);
        localStreamRef.current = stream;
        return true;
      } catch (error) {
        console.error("Error initializing media:", error);
        return false;
      }
    },
    []
  );

  // Create room
  const createRoom = useCallback(async (userName: string): Promise<string> => {
    try {
      const roomRef = await addDoc(collection(db, "rooms"), {
        createdAt: serverTimestamp(),
        host: userName,
        participants: [userName],
      });

      setRoomId(roomRef.id);
      setIsHost(true);
      setUserId(userName);
      return roomRef.id;
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  }, []);

  // Join room
  const joinRoom = useCallback(
    async (roomId: string, userName: string): Promise<void> => {
      try {
        const roomRef = doc(db, "rooms", roomId);
        const roomDoc = await getDoc(roomRef);

        if (!roomDoc.exists()) {
          throw new Error("Room not found");
        }

        await updateDoc(roomRef, {
          participants: [...roomDoc.data().participants, userName],
        });

        setRoomId(roomId);
        setUserId(userName);
      } catch (error) {
        console.error("Error joining room:", error);
        throw error;
      }
    },
    []
  );

  // Leave room
  const leaveRoom = useCallback(async (): Promise<void> => {
    if (!roomId || !userId) return;

    try {
      const roomRef = doc(db, "rooms", roomId);
      const roomDoc = await getDoc(roomRef);

      if (roomDoc.exists()) {
        const participants = roomDoc
          .data()
          .participants.filter((p: string) => p !== userId);

        if (participants.length === 0) {
          await deleteDoc(roomRef);
        } else {
          await updateDoc(roomRef, { participants });
        }
      }

      // Clean up peer connections
      Object.values(peerManagersRef.current).forEach((manager) =>
        manager.close()
      );
      peerManagersRef.current = {};

      // Clean up local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
        setLocalStream(null);
      }

      // Clean up remote streams
      setRemoteStreams({});

      // Reset state
      setRoomId(null);
      setIsHost(false);
      setUserId("");
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  }, [roomId, userId]);

  // Toggle track
  const toggleTrack = useCallback(
    (kind: "audio" | "video", enabled: boolean): void => {
      if (!localStreamRef.current) return;

      const tracks = localStreamRef.current.getTracks();
      const track = tracks.find((t) => t.kind === kind);
      if (track) {
        track.enabled = enabled;
      }
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (!isLeavingRef.current) {
        leaveRoom();
      }
    };
  }, [leaveRoom]);

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
