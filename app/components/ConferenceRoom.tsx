// File: ConferenceRoom.tsx
"use client";

import React, { useState } from "react";
import ConferenceView from "../services/stream/components/ConferenceView";
import JoinView from "../services/stream/components/JoinView";
import useWebRTC from "../hooks/useWebRTC";
import type { WebRTCHookReturn } from "../hooks/useWebRTC";

interface ConferenceRoomProps {
  userName: string;
  roomId?: string;
  onLeave?: () => void;
  webRTC?: WebRTCHookReturn;
}

const ConferenceRoom: React.FC<ConferenceRoomProps> = ({
  userName,
  roomId: initialRoomId,
  onLeave,
  webRTC: externalWebRTC,
}) => {
  const [isJoined, setIsJoined] = useState<boolean>(false);

  // Initialize WebRTC hook
  const localWebRTC = useWebRTC();
  const webRTC = externalWebRTC || localWebRTC;

  // Handle leaving the conference
  const handleLeave = async () => {
    if (!externalWebRTC) {
      await webRTC.leaveRoom();
    }

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
