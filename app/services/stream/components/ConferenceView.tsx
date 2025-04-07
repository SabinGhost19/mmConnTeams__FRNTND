// File: ConferenceView.tsx
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ScreenShare,
  Settings,
  MessageSquare,
  UserPlus,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Users,
  Pin,
  PinOff,
  X,
} from "lucide-react";
import type { WebRTCHookReturn, Participant } from "@/app/hooks/useWebRTC";

interface ChatMessageType {
  sender: string;
  text: string;
  time: Date;
  isLocal: boolean;
}

interface ConferenceViewProps {
  userName: string;
  webRTC: WebRTCHookReturn;
  onLeave: () => void;
}

const ConferenceView: React.FC<ConferenceViewProps> = ({
  userName,
  webRTC,
  onLeave,
}) => {
  const {
    localStream,
    remoteStreams,
    roomId,
    participants,
    isHost,
    leaveRoom,
    toggleTrack,
  } = webRTC;

  // State variables
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [screenShareStream, setScreenShareStream] =
    useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [pinnedParticipant, setPinnedParticipant] = useState<string | null>(
    null
  );
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [showParticipants, setShowParticipants] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");
  const [layoutMode, setLayoutMode] = useState<"grid" | "gallery" | "focus">(
    "grid"
  );
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [inviteModalOpen, setInviteModalOpen] = useState<boolean>(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [showMediaErrorModal, setShowMediaErrorModal] =
    useState<boolean>(false);
  const [viewConfig, setViewConfig] = useState({
    itemsPerPage: 4,
    maxGridItems: 6,
  });

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>(
    {}
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // State for debug panel
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);
  const [connectionStats, setConnectionStats] = useState<Record<string, any>>(
    {}
  );

  // Add state for connection issues
  const [connectionIssues, setConnectionIssues] = useState<
    Record<string, string>
  >({});
  const [attemptingReconnect, setAttemptingReconnect] =
    useState<boolean>(false);

  // Debugging - afișează informații despre stream-uri în consolă
  useEffect(() => {
    const handleVideoPlay = async (videoElement: HTMLVideoElement | null) => {
      if (!videoElement) return;

      try {
        // Use a flag to prevent competing play/pause calls
        if (!videoElement.dataset.isPlaying && videoElement.srcObject) {
          videoElement.dataset.isPlaying = "true";

          // Use a more reliable play method with proper error handling
          await videoElement.play().catch((error) => {
            videoElement.dataset.isPlaying = "false";
            if (error.name !== "AbortError") {
              console.error("Error playing video:", error);
            }
          });
        }
      } catch (error) {
        videoElement.dataset.isPlaying = "false";
        if (error instanceof DOMException && error.name === "AbortError") {
          console.warn(
            "Redare video întreruptă. Se va încerca automat din nou."
          );
          // Don't manually retry - the browser will handle this automatically
        } else {
          console.error("Eroare la redarea video:", error);
        }
      }
    };

    // Pentru stream local
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      handleVideoPlay(localVideoRef.current);
    }

    // Pentru stream-urile remote
    Object.entries(remoteStreams).forEach(([peerId, stream]) => {
      const videoElement = remoteVideoRefs.current[peerId];
      if (videoElement) {
        videoElement.srcObject = stream;
        handleVideoPlay(videoElement);
      }
    });
  }, [localStream, remoteStreams]);

  // Effect to check media device availability on component mount
  useEffect(() => {
    const checkMediaDevices = async () => {
      try {
        // Check if MediaDevices API is supported
        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.enumerateDevices
        ) {
          setMediaError("Your browser doesn't support media devices access");
          setShowMediaErrorModal(true);
          setVideoEnabled(false);
          return;
        }

        // List available devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoInput = devices.some(
          (device) => device.kind === "videoinput"
        );
        const hasAudioInput = devices.some(
          (device) => device.kind === "audioinput"
        );

        if (!hasVideoInput && !hasAudioInput) {
          setMediaError("No camera or microphone detected on your device");
          setShowMediaErrorModal(true);
          setVideoEnabled(false);
        } else if (!hasVideoInput) {
          console.warn("No camera detected. Continuing with audio only.");
          setVideoEnabled(false);
        } else if (!hasAudioInput) {
          console.warn("No microphone detected. Continuing with video only.");
          setAudioEnabled(false);
        }
      } catch (error) {
        console.error("Error enumerating media devices:", error);
        setMediaError("Error detecting your camera and microphone");
        setShowMediaErrorModal(true);
        setVideoEnabled(false);
      }
    };

    checkMediaDevices();
  }, []);

  // Calculează participanții activi (inclusiv utilizatorul curent)
  const activeParticipants = useMemo(() => {
    // Adaugă utilizatorul curent și toți participanții
    return [
      {
        id: "local",
        userName,
        isHost,
        isLocal: true,
      },
      ...participants,
    ];
  }, [participants, userName, isHost]);

  // Participanți pentru vizualizarea curentă
  const visibleParticipants = useMemo(() => {
    if (pinnedParticipant) {
      const pinned = activeParticipants.find((p) => p.id === pinnedParticipant);
      const others = activeParticipants.filter(
        (p) => p.id !== pinnedParticipant
      );
      return pinned ? [pinned, ...others] : activeParticipants;
    }

    if (layoutMode === "gallery") {
      const startIdx = currentSlide * viewConfig.itemsPerPage;
      return activeParticipants.slice(
        startIdx,
        startIdx + viewConfig.itemsPerPage
      );
    }

    return activeParticipants;
  }, [
    activeParticipants,
    pinnedParticipant,
    layoutMode,
    currentSlide,
    viewConfig.itemsPerPage,
  ]);

  // Calcul pentru layout
  const gridStyles = useMemo(() => {
    if (layoutMode === "focus" && pinnedParticipant) {
      return {
        gridTemplateColumns: "1fr",
        gridAutoRows: "1fr",
      };
    }

    const participantCount = visibleParticipants.length;

    if (layoutMode === "gallery") {
      return {
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gridAutoRows: "1fr",
      };
    }

    // Grid adaptiv în funcție de numărul de participanți
    if (participantCount <= 1) {
      return {
        gridTemplateColumns: "1fr",
        gridAutoRows: "1fr",
      };
    } else if (participantCount <= 2) {
      return {
        gridTemplateColumns: "1fr 1fr",
        gridAutoRows: "1fr",
      };
    } else if (participantCount <= 4) {
      return {
        gridTemplateColumns: "1fr 1fr",
        gridAutoRows: "1fr 1fr",
      };
    } else {
      return {
        gridTemplateColumns: "repeat(3, 1fr)",
        gridAutoRows: "1fr",
      };
    }
  }, [layoutMode, visibleParticipants.length, pinnedParticipant]);

  // Calculează numărul total de "pagini" pentru modul galerie
  const totalSlides = Math.ceil(
    activeParticipants.length / viewConfig.itemsPerPage
  );

  // Ajustează layoutul în funcție de dimensiunea containerului
  useEffect(() => {
    const updateViewConfig = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth;

      if (width < 640) {
        setViewConfig({
          itemsPerPage: 2,
          maxGridItems: 4,
        });
      } else if (width < 1024) {
        setViewConfig({
          itemsPerPage: 4,
          maxGridItems: 6,
        });
      } else {
        setViewConfig({
          itemsPerPage: 6,
          maxGridItems: 9,
        });
      }
    };

    updateViewConfig();

    const resizeObserver = new ResizeObserver(updateViewConfig);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Efect special pentru atribuirea și gestionarea stream-urilor video
  useEffect(() => {
    // We'll use a debounced approach to prevent rapid-fire play/pause cycles
    let playTimeouts: { [key: string]: NodeJS.Timeout } = {};

    const safePlay = (videoElement: HTMLVideoElement, id: string) => {
      // Clear any existing timeout for this video element
      if (playTimeouts[id]) {
        clearTimeout(playTimeouts[id]);
      }

      // Set a small delay before attempting to play
      playTimeouts[id] = setTimeout(() => {
        if (videoElement && videoElement.paused && videoElement.srcObject) {
          videoElement.play().catch((err) => {
            // Only log non-abort errors since abort errors are expected during normal operation
            if (err.name !== "AbortError") {
              console.error(`Error playing video for ${id}:`, err);
            }
          });
        }
      }, 100);
    };

    // Asigură-te că localStream este atribuit elementului video local
    if (localStream && localVideoRef.current) {
      // Only set srcObject if it's different to avoid unnecessary media pipeline restarts
      if (localVideoRef.current.srcObject !== localStream) {
        localVideoRef.current.srcObject = localStream;
        safePlay(localVideoRef.current, "local");
      }
    }

    // Verificăm și forțăm atribuirea tuturor stream-urilor remote
    Object.entries(remoteStreams).forEach(([peerId, stream]) => {
      const videoElement = remoteVideoRefs.current[peerId];
      if (videoElement && videoElement.srcObject !== stream) {
        videoElement.srcObject = stream;
        safePlay(videoElement, peerId);
      }
    });

    // Clean up timeouts when unmounting or when streams change
    return () => {
      Object.values(playTimeouts).forEach((timeout) => clearTimeout(timeout));
    };
  }, [localStream, remoteStreams]);

  // Când se schimbă starea audio/video locală
  useEffect(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      const audioTracks = localStream.getAudioTracks();

      if (videoTracks.length > 0) {
        setVideoEnabled(videoTracks[0].enabled);
      }

      if (audioTracks.length > 0) {
        setAudioEnabled(audioTracks[0].enabled);
      }
    }
  }, [localStream]);

  // Toggle video
  const handleToggleVideo = () => {
    // If we have no video devices, show error message
    if (mediaError && !videoEnabled) {
      setShowMediaErrorModal(true);
      return;
    }

    setVideoEnabled(!videoEnabled);
    toggleTrack("video", !videoEnabled);
  };

  // Toggle audio
  const handleToggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    toggleTrack("audio", !audioEnabled);
  };

  // Toggle screen sharing
  const handleToggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        setScreenShareStream(stream);
        setIsScreenSharing(true);

        // Handle stream ending
        stream.getVideoTracks()[0].onended = () => {
          setScreenShareStream(null);
          setIsScreenSharing(false);
        };
      } catch (error) {
        console.error("Error sharing screen:", error);
      }
    } else {
      if (screenShareStream) {
        screenShareStream.getTracks().forEach((track) => track.stop());
        setScreenShareStream(null);
        setIsScreenSharing(false);
      }
    }
  };

  // End call
  const handleEndCall = async () => {
    try {
      await leaveRoom();
      onLeave();
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  // Send chat message
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMessage: ChatMessageType = {
      sender: userName,
      text: messageInput,
      time: new Date(),
      isLocal: true,
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setMessageInput("");
  };

  // Comută fixarea unui participant
  const togglePinParticipant = (participantId: string) => {
    if (pinnedParticipant === participantId) {
      setPinnedParticipant(null);
    } else {
      setPinnedParticipant(participantId);
    }
  };

  // Schimbă diapozitivul curent în modul galerie
  const changeSlide = (direction: "next" | "prev") => {
    if (direction === "next") {
      setCurrentSlide((prev) => prev + 1);
    } else {
      setCurrentSlide((prev) => Math.max(0, prev - 1));
    }
  };

  const setVideoRef = (
    el: HTMLVideoElement | null,
    isLocal: boolean,
    participantId: string
  ) => {
    if (isLocal) {
      if (el !== localVideoRef.current) {
        localVideoRef.current = el;

        // Ensure the video element has the correct srcObject
        if (el && localStream && el.srcObject !== localStream) {
          el.srcObject = localStream;
          el.play().catch((err) => {
            console.warn("Could not autoplay local video:", err);
          });
        }
      }
    } else {
      // For remote videos, maintain a reference to each participant's video element
      if (
        !remoteVideoRefs.current[participantId] ||
        remoteVideoRefs.current[participantId] !== el
      ) {
        remoteVideoRefs.current[participantId] = el;

        // Ensure the video element has the correct srcObject
        const stream = remoteStreams[participantId];
        if (el && stream && el.srcObject !== stream) {
          console.log(`Setting srcObject for ${participantId}`);
          el.srcObject = stream;
          el.play().catch((err) => {
            console.warn(
              `Could not autoplay remote video for ${participantId}:`,
              err
            );
          });
        }
      }
    }
  };

  const setupVideoElement = async (stream: MediaStream | null) => {
    if (!stream) return;

    const videoElement =
      stream.id === "local"
        ? localVideoRef.current
        : remoteVideoRefs.current[stream.id];
    if (!videoElement) return;

    try {
      // Only set srcObject if it's different
      if (videoElement.srcObject !== stream) {
        videoElement.srcObject = stream;

        // Use a timeout to avoid immediate play after setting srcObject
        // This helps prevent the AbortError when pause is called shortly after play
        setTimeout(() => {
          if (videoElement.paused) {
            videoElement.play().catch((error) => {
              if (error.name !== "AbortError") {
                console.error("Error playing video:", error);
              }
            });
          }
        }, 50);
      }
    } catch (error) {
      console.error("Error setting up video element:", error);
    }
  };

  // Funcție pentru a afișa butoanele de control pentru galerie
  const renderGalleryControls = () => {
    if (layoutMode !== "gallery") return null;

    const totalSlides = Math.ceil(
      activeParticipants.length / viewConfig.itemsPerPage
    );
    const canGoNext = currentSlide < totalSlides - 1;
    const canGoPrev = currentSlide > 0;

    return (
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
        <button
          onClick={() => changeSlide("prev")}
          disabled={!canGoPrev}
          className={`p-2 rounded-full ${
            canGoPrev ? "bg-gray-800 text-white" : "bg-gray-300 text-gray-500"
          }`}
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-white bg-black bg-opacity-50 px-2 py-1 rounded">
          {currentSlide + 1} / {totalSlides}
        </span>
        <button
          onClick={() => changeSlide("next")}
          disabled={!canGoNext}
          className={`p-2 rounded-full ${
            canGoNext ? "bg-gray-800 text-white" : "bg-gray-300 text-gray-500"
          }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  // Funcție pentru a afișa controalele de layout
  const renderLayoutControls = () => {
    return (
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          onClick={() => setLayoutMode("grid")}
          className={`p-2 rounded ${
            layoutMode === "grid"
              ? "bg-blue-500 text-white"
              : "bg-gray-800 text-white"
          }`}
          title="Grid View"
        >
          <Monitor size={20} />
        </button>
        <button
          onClick={() => setLayoutMode("gallery")}
          className={`p-2 rounded ${
            layoutMode === "gallery"
              ? "bg-blue-500 text-white"
              : "bg-gray-800 text-white"
          }`}
          title="Gallery View"
        >
          <Users size={20} />
        </button>
        <button
          onClick={() => setLayoutMode("focus")}
          className={`p-2 rounded ${
            layoutMode === "focus"
              ? "bg-blue-500 text-white"
              : "bg-gray-800 text-white"
          }`}
          title="Focus View"
        >
          <Pin size={20} />
        </button>
      </div>
    );
  };

  // Funcție pentru a afișa componenta participant
  const renderParticipant = (
    participant: Participant & { isLocal?: boolean },
    index: number
  ) => {
    const isLocal = participant.isLocal || false;
    const stream = isLocal ? localStream : remoteStreams[participant.id];
    const isPinned = pinnedParticipant === participant.id;

    // Determine audio status
    const audioTracks = stream?.getAudioTracks() || [];
    const isMuted = isLocal
      ? !audioEnabled
      : audioTracks.length === 0 || !audioTracks[0]?.enabled;

    // Log detailed audio track info for debugging
    if (!isLocal && stream && audioTracks.length > 0) {
      console.log(`Audio track for ${participant.id}:`, {
        enabled: audioTracks[0]?.enabled,
        muted: audioTracks[0]?.muted,
        readyState: audioTracks[0]?.readyState,
      });
    }

    // Improved video track detection
    const videoTracks = stream?.getVideoTracks() || [];
    const hasVideoTrack = videoTracks.length > 0;
    const hasVideo = isLocal
      ? videoEnabled && hasVideoTrack
      : hasVideoTrack && videoTracks[0]?.enabled !== false;

    // Determine if this is an audio-only participant
    const isAudioOnly =
      stream && audioTracks.length > 0 && (!hasVideoTrack || !hasVideo);

    // Log stream info for debugging
    if (!isLocal && stream) {
      console.log(
        `Remote stream for ${participant.userName} (${participant.id}):`,
        {
          hasStream: !!stream,
          hasVideoTrack,
          videoTrackEnabled: hasVideoTrack ? videoTracks[0]?.enabled : false,
          audioTrackEnabled:
            audioTracks.length > 0 ? audioTracks[0]?.enabled : false,
          videoTracks: videoTracks.map((t) => ({
            kind: t.kind,
            enabled: t.enabled,
            id: t.id,
          })),
          audioTracks: audioTracks.map((t) => ({
            kind: t.kind,
            enabled: t.enabled,
            id: t.id,
          })),
          streamActive: stream.active,
          isAudioOnly,
        }
      );
    }

    return (
      <div
        key={participant.id}
        className={`relative rounded-lg overflow-hidden ${
          isPinned ? "col-span-2 row-span-2" : ""
        }`}
      >
        {stream && hasVideo ? (
          <video
            ref={(el) => setVideoRef(el, isLocal, participant.id)}
            autoPlay
            playsInline
            muted={isLocal}
            className="w-full h-full object-cover"
            onLoadedMetadata={(e) => {
              // Try to play the video as soon as metadata is loaded
              const vid = e.target as HTMLVideoElement;
              vid.play().catch((err) => {
                console.warn(
                  `Could not autoplay video for ${participant.id}:`,
                  err
                );
              });
            }}
          />
        ) : (
          <div
            className={`w-full h-full ${
              isAudioOnly ? "bg-blue-800" : "bg-gray-800"
            } flex flex-col items-center justify-center`}
          >
            <div className="text-white text-4xl font-bold mb-2">
              {participant.userName.charAt(0).toUpperCase()}
            </div>
            {isAudioOnly && (
              <div className="text-white text-sm bg-black bg-opacity-40 px-2 py-1 rounded">
                Audio Only
              </div>
            )}
          </div>
        )}

        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
          <div className="text-white bg-black bg-opacity-50 px-2 py-1 rounded">
            {participant.userName} {isLocal ? "(You)" : ""}
            {participant.isHost && " (Host)"}
          </div>
          <div className="flex space-x-2">
            {isMuted && (
              <div className="bg-black bg-opacity-50 p-1 rounded">
                <MicOff size={16} className="text-white" />
              </div>
            )}
            {!hasVideo && (
              <div className="bg-black bg-opacity-50 p-1 rounded">
                <VideoOff size={16} className="text-white" />
              </div>
            )}
            <button
              onClick={() => togglePinParticipant(participant.id)}
              className="bg-black bg-opacity-50 p-1 rounded"
            >
              {isPinned ? (
                <PinOff size={16} className="text-white" />
              ) : (
                <Pin size={16} className="text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Hidden audio element for audio-only participants */}
        {isAudioOnly && (
          <audio
            autoPlay
            ref={(el) => {
              if (el && stream && !isLocal) {
                if (el.srcObject !== stream) {
                  el.srcObject = stream;
                  el.play().catch((err) => {
                    console.warn(
                      `Could not play audio for ${participant.id}:`,
                      err
                    );
                  });
                }
              }
            }}
          />
        )}
      </div>
    );
  };

  // Funcție pentru a copia ID-ul camerei
  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      // Aici ar putea fi adăugată o notificare de tip "toast"
    }
  };

  // Retry accessing media devices
  const retryMediaAccess = async () => {
    try {
      setMediaError(null);
      setShowMediaErrorModal(false);

      const constraints = {
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // If we get here, we successfully got a stream
      if (stream) {
        // In a real implementation, you would need to update the WebRTC connection
        // For this example we'll just update our local state
        setVideoEnabled(true);
        setAudioEnabled(true);
      }
    } catch (error) {
      console.error("Error retrying media access:", error);
      if (error instanceof DOMException) {
        if (error.name === "NotFoundError") {
          setMediaError("No camera or microphone found on your device");
        } else if (error.name === "NotAllowedError") {
          setMediaError("Please allow access to your camera and microphone");
        } else {
          setMediaError(`Media error: ${error.message}`);
        }
      } else {
        setMediaError("Unknown error accessing your camera and microphone");
      }
      setShowMediaErrorModal(true);
    }
  };

  // Dedicated effect for monitoring remote streams
  useEffect(() => {
    // Skip if there are no remote streams
    if (Object.keys(remoteStreams).length === 0) return;

    console.log("Remote streams updated:", Object.keys(remoteStreams));

    // For each remote stream, check if we have a video element
    Object.entries(remoteStreams).forEach(([peerId, stream]) => {
      // Check if this is a new stream
      if (stream) {
        // Get or create video element
        let videoElement = remoteVideoRefs.current[peerId];

        // If we already have a video element, update it
        if (videoElement) {
          if (videoElement.srcObject !== stream) {
            console.log(`Updating existing video element for ${peerId}`);
            videoElement.srcObject = stream;
            videoElement.play().catch((err) => {
              console.warn(`Could not play video for ${peerId}:`, err);
            });
          }
        }

        // Log active tracks
        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();

        console.log(`PeerID ${peerId} stream:`, {
          active: stream.active,
          videoTracks: videoTracks.length,
          audioTracks: audioTracks.length,
          videoEnabled: videoTracks.length > 0 ? videoTracks[0].enabled : false,
        });
      }
    });

    // Clean up references for peers that no longer have streams
    Object.keys(remoteVideoRefs.current).forEach((peerId) => {
      if (!remoteStreams[peerId]) {
        delete remoteVideoRefs.current[peerId];
      }
    });
  }, [remoteStreams]);

  // Effect to gather connection stats
  useEffect(() => {
    if (!showDebugPanel) return;

    const getConnectionStats = async () => {
      const stats: Record<string, any> = {
        connections: {},
        participantCount: participants.length,
        remoteStreamCount: Object.keys(remoteStreams).length,
      };

      // Get access to peer connections via props
      // This is a workaround since we don't have direct access to peerConnections
      // In a production app, you'd want to expose this via the WebRTC hook
      const peerConnectionsMap: Record<string, RTCPeerConnection> = {};

      // Gather information from remote streams and participants
      Object.keys(remoteStreams).forEach((peerId) => {
        const participant = participants.find((p) => p.id === peerId);
        if (participant) {
          stats.connections[peerId] = {
            connectionState: "unknown", // We'll update what we can
            iceConnectionState: "unknown",
            iceGatheringState: "unknown",
            signalingState: "unknown",
            participantName: participant.userName || "Unknown",
            hasAudio: remoteStreams[peerId]?.getAudioTracks().length > 0,
            hasVideo: remoteStreams[peerId]?.getVideoTracks().length > 0,
          };
        }
      });

      setConnectionStats(stats);
    };

    // Update stats every 3 seconds
    const interval = setInterval(getConnectionStats, 3000);
    getConnectionStats(); // Initial call

    return () => clearInterval(interval);
  }, [showDebugPanel, participants, remoteStreams]);

  // Render debug panel
  const renderDebugPanel = () => {
    if (!showDebugPanel) return null;

    return (
      <div
        className="absolute left-4 bottom-20 bg-black bg-opacity-80 p-4 rounded-lg text-white text-xs max-w-md overflow-auto"
        style={{ maxHeight: "40vh" }}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">WebRTC Debug</h3>
          <button
            onClick={() => setShowDebugPanel(false)}
            className="text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div>
          <p>Room ID: {roomId}</p>
          <p>
            Your ID:{" "}
            {participants.find((p) => p.isHost === isHost)?.id || "Unknown"}
          </p>
          <p>Participants: {connectionStats.participantCount}</p>
          <p>Remote Streams: {connectionStats.remoteStreamCount}</p>
        </div>

        <div className="mt-2">
          <h4 className="font-semibold mb-1">Connections:</h4>
          {Object.entries(connectionStats.connections || {}).map(
            ([id, stats]: [string, any]) => (
              <div key={id} className="mb-2 border-t border-gray-700 pt-1">
                <p>
                  <span className="font-medium">{stats.participantName}</span> (
                  {id.substring(0, 6)}...)
                </p>
                <p
                  className={`${
                    stats.connectionState === "connected"
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  Connection: {stats.connectionState}
                </p>
                <p
                  className={`${
                    stats.iceConnectionState === "connected" ||
                    stats.iceConnectionState === "completed"
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  ICE: {stats.iceConnectionState}
                </p>
                <p>Signaling: {stats.signalingState}</p>
                <p>
                  Media: {stats.hasAudio ? "🔊" : "🔇"}{" "}
                  {stats.hasVideo ? "📹" : "📵"}
                </p>
              </div>
            )
          )}

          {Object.keys(connectionStats.connections || {}).length === 0 && (
            <p className="text-gray-400">No active connections</p>
          )}
        </div>
      </div>
    );
  };

  // Function to manually reconnect when connection fails
  const handleReconnect = async () => {
    setAttemptingReconnect(true);

    try {
      // First leave the room - this will clean up peer connections
      await leaveRoom();

      // Wait a moment to ensure everything is cleaned up
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Re-join the room
      if (roomId) {
        await webRTC.joinRoom(roomId, userName);
      }

      // Clear connection issues
      setConnectionIssues({});
    } catch (error) {
      console.error("Error reconnecting:", error);
    } finally {
      setAttemptingReconnect(false);
    }
  };

  // Monitor for ICE connection failures
  useEffect(() => {
    // Check if any participants have dropped but are still in the list
    const checkConnectionStatus = () => {
      const issues: Record<string, string> = {};

      participants.forEach((participant) => {
        // If we don't have a stream for this participant but they're marked as active
        if (!remoteStreams[participant.id] && participant.streamActive) {
          issues[participant.id] = "No connection";
        }
      });

      if (Object.keys(issues).length > 0) {
        setConnectionIssues(issues);
      } else if (Object.keys(connectionIssues).length > 0) {
        setConnectionIssues({});
      }
    };

    // Check every 10 seconds
    const interval = setInterval(checkConnectionStatus, 10000);

    return () => clearInterval(interval);
  }, [participants, remoteStreams, connectionIssues]);

  // Render connection issues banner
  const renderConnectionIssuesBanner = () => {
    if (Object.keys(connectionIssues).length === 0) return null;

    return (
      <div className="absolute top-16 inset-x-0 mx-auto max-w-md bg-yellow-600 text-white p-3 rounded-lg shadow-lg flex justify-between items-center">
        <div>
          <p className="font-semibold">Connection issues detected</p>
          <p className="text-sm">
            Some participants may not be connected properly
          </p>
        </div>
        <button
          onClick={handleReconnect}
          disabled={attemptingReconnect}
          className="bg-white text-yellow-700 px-3 py-1 rounded hover:bg-yellow-100 disabled:opacity-50"
        >
          {attemptingReconnect ? "Reconnecting..." : "Reconnect"}
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 relative">
        <div
          ref={containerRef}
          className="h-full grid gap-2 p-4"
          style={gridStyles}
        >
          {visibleParticipants.map((participant, index) =>
            renderParticipant(participant, index)
          )}
        </div>

        {renderGalleryControls()}
        {renderLayoutControls()}
        {renderConnectionIssuesBanner()}

        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <button
            onClick={copyRoomId}
            className="bg-gray-800 text-white px-3 py-1 rounded"
          >
            Room ID: {roomId}
          </button>
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="bg-gray-800 text-white p-2 rounded"
          >
            <Users size={20} />
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className="bg-gray-800 text-white p-2 rounded"
          >
            <MessageSquare size={20} />
          </button>
          <button
            onClick={() => setInviteModalOpen(true)}
            className="bg-gray-800 text-white p-2 rounded"
          >
            <UserPlus size={20} />
          </button>
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className={`p-2 rounded ${
              showDebugPanel ? "bg-blue-600" : "bg-gray-800"
            } text-white`}
            title="Debug Panel"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Render debug panel */}
        {renderDebugPanel()}
      </div>

      <div className="bg-gray-900 p-4 flex justify-center space-x-4">
        <button
          onClick={handleToggleAudio}
          className={`p-3 rounded-full ${
            audioEnabled ? "bg-gray-700" : "bg-red-500"
          }`}
        >
          {audioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
        <button
          onClick={handleToggleVideo}
          className={`p-3 rounded-full ${
            videoEnabled ? "bg-gray-700" : "bg-red-500"
          }`}
        >
          {videoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
        <button
          onClick={handleToggleScreenShare}
          className={`p-3 rounded-full ${
            isScreenSharing ? "bg-green-500" : "bg-gray-700"
          }`}
        >
          <ScreenShare size={24} />
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 rounded-full bg-gray-700"
        >
          <Settings size={24} />
        </button>
        <button onClick={handleEndCall} className="p-3 rounded-full bg-red-500">
          <PhoneOff size={24} />
        </button>
      </div>

      {showChat && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-900 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Chat</h3>
            <button onClick={() => setShowChat(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto mb-4">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 ${msg.isLocal ? "text-right" : "text-left"}`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    msg.isLocal
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-white"
                  }`}
                >
                  <div className="text-xs">{msg.sender}</div>
                  <div>{msg.text}</div>
                  <div className="text-xs text-right">
                    {msg.time.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="flex">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 rounded-l bg-gray-800 text-white"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-r"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {showParticipants && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-900 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Participants</h3>
            <button onClick={() => setShowParticipants(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeParticipants.map((participant) => {
              const isLocal = "isLocal" in participant && participant.isLocal;
              return (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-800 rounded"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-2">
                      {participant.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">
                        {participant.userName} {isLocal ? "(You)" : ""}
                      </div>
                      <div className="text-xs text-gray-400">
                        {participant.isHost ? "Host" : "Participant"}
                      </div>
                    </div>
                  </div>
                  {!isLocal && (
                    <button
                      onClick={() => togglePinParticipant(participant.id)}
                      className="p-1 rounded hover:bg-gray-700"
                    >
                      {pinnedParticipant === participant.id ? (
                        <PinOff size={16} />
                      ) : (
                        <Pin size={16} />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Media Error Modal */}
      {showMediaErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">
              Camera or Microphone Issue
            </h3>
            <div className="mb-6 text-gray-300">
              <p className="mb-2">
                {mediaError ||
                  "There was an issue accessing your camera or microphone"}
              </p>
              <p>
                You can still join the conference, but others won't be able to
                see or hear you until this is resolved.
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={retryMediaAccess}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Retry Camera/Mic Access
              </button>
              <button
                onClick={() => setShowMediaErrorModal(false)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded"
              >
                Continue Without Camera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Other modals */}
      {inviteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Invite to Room</h3>
            <p className="mb-4">
              Share this room ID with others to join your meeting:
            </p>
            <div className="flex mb-4">
              <input
                type="text"
                value={roomId || ""}
                readOnly
                className="flex-1 p-2 bg-gray-800 rounded-l"
              />
              <button
                onClick={copyRoomId}
                className="bg-blue-500 text-white px-4 py-2 rounded-r"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setInviteModalOpen(false)}
              className="w-full bg-gray-700 text-white py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConferenceView;
