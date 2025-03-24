// File: ConferenceRoom.tsx
"use client";

import React, { useState } from "react";
import ConferenceView from "./components/ConferenceView";
import JoinView from "./components/JoinView";
import useWebRTC from "../../hooks/useWebRTC";

interface ConferenceRoomProps {
  userName: string;
  roomId?: string;
  onLeave?: () => void;
}

const ConferenceRoom: React.FC<ConferenceRoomProps> = ({
  userName,
  roomId: initialRoomId,
  onLeave,
}) => {
  const [isJoined, setIsJoined] = useState<boolean>(false);

  // Initialize WebRTC hook
  const webRTC = useWebRTC();

  // Handle leaving the conference
  const handleLeave = async () => {
    setIsJoined(false);
    if (onLeave) {
      onLeave();
    }
  };

  // Handle joining the conference
  const handleJoined = () => {
    setIsJoined(true);
  };

  return isJoined ? (
    <ConferenceView userName={userName} webRTC={webRTC} onLeave={handleLeave} />
  ) : (
    <JoinView
      userName={userName}
      initialRoomId={initialRoomId}
      webRTC={webRTC}
      onJoined={handleJoined}
    />
  );
};

export default ConferenceRoom;
