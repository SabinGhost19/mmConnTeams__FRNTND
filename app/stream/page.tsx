// File: TeamSyncApp.tsx
"use client";

import { useState } from "react";
import PreConferenceSetup from "../components/PreConferenceSetup";
import ConferenceRoom from "../components/ConferenceRoom";
import useWebRTC from "../hooks/useWebRTC";

interface SelectedDevices {
  camera: string;
  microphone: string;
}

interface MediaState {
  video: boolean;
  audio: boolean;
}

const TeamSyncApp = () => {
  const [isInPreSetup, setIsInPreSetup] = useState(true);
  const [userName, setUserName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [selectedDevices, setSelectedDevices] =
    useState<SelectedDevices | null>(null);
  const [mediaState, setMediaState] = useState<MediaState | null>(null);

  // Initialize the WebRTC hook at the app level
  const webRTC = useWebRTC();

  const handleJoinConference = async (
    name: string,
    room: string,
    devices: SelectedDevices,
    media: MediaState
  ) => {
    try {
      // Initialize media with the selected devices
      await webRTC.initializeMedia(media.video, media.audio, {
        videoId: devices.camera,
        audioId: devices.microphone,
      });

      // Save the setup information
      setUserName(name);
      setRoomId(room);
      setSelectedDevices(devices);
      setMediaState(media);

      // Create or join the room using WebRTC
      if (room) {
        await webRTC.joinRoom(room, name);
      } else {
        await webRTC.createRoom(name);
      }

      // Move to the conference room
      setIsInPreSetup(false);
    } catch (error) {
      console.error("Failed to join conference:", error);
      alert(
        "Could not join the conference. Please check your device permissions."
      );
    }
  };

  const handleLeaveConference = async () => {
    // Clean up WebRTC
    await webRTC.leaveRoom();

    // Return to pre-setup
    setIsInPreSetup(true);
  };

  return isInPreSetup ? (
    <PreConferenceSetup onJoin={handleJoinConference} roomIdToJoin={roomId} />
  ) : (
    <ConferenceRoom
      userName={userName}
      roomId={roomId}
      onLeave={handleLeaveConference}
      webRTC={webRTC} // Pass the WebRTC hook to ConferenceRoom
    />
  );
};

export default TeamSyncApp;
