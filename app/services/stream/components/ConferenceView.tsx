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
import type { WebRTCHookReturn, ParticipantType } from "@/app/hooks/useWebRTC";

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
    selectParticipantStream,
    selectedParticipants,
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

  // Debugging - afișează informații despre stream-uri în consolă
  useEffect(() => {
    const handleVideoPlay = async (videoElement: HTMLVideoElement | null) => {
      if (!videoElement) return;

      try {
        // Oprește redarea curentă și șterge sursa pentru a preveni conflictele
        videoElement.pause();
        videoElement.currentTime = 0;

        // Verifică dacă există un stream valid
        if (videoElement.srcObject) {
          // Folosește o metodă mai sigură de redare
          await videoElement.play();
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          console.warn("Redare video întreruptă. Reîncercare...");

          // Adaugă o mică întârziere și reîncearcă
          setTimeout(() => {
            try {
              videoElement.play().catch((retryError) => {
                console.error(
                  "Eroare la reîncercarea redării video:",
                  retryError
                );
              });
            } catch (retryError) {
              console.error(
                "Eroare la reîncercarea redării video:",
                retryError
              );
            }
          }, 100);
        } else {
          console.error("Eroare la redarea video:", error);
        }
      }
    };

    // Pentru stream local
    if (localStream && localVideoRef.current) {
      handleVideoPlay(localVideoRef.current);
    }

    // Pentru stream-urile remote
    Object.entries(remoteStreams).forEach(([peerId, stream]) => {
      const videoElement = remoteVideoRefs.current[peerId];
      if (videoElement) {
        handleVideoPlay(videoElement);
      }
    });
  }, [localStream, remoteStreams]);

  // Calculează participanții activi (inclusiv utilizatorul curent)
  const activeParticipants = useMemo(() => {
    const filteredParticipants = participants.filter((p) =>
      selectedParticipants.includes(p.id)
    );

    // Adaugă utilizatorul curent
    return [
      {
        id: "local",
        userName,
        isHost,
        isLocal: true,
      },
      ...filteredParticipants,
    ];
  }, [participants, selectedParticipants, userName, isHost]);

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

  // Participanți care nu sunt selectați
  const unselectedParticipants = useMemo(() => {
    return participants.filter((p) => !selectedParticipants.includes(p.id));
  }, [participants, selectedParticipants]);

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
    // Asigură-te că localStream este atribuit elementului video local
    if (localStream && localVideoRef.current) {
      console.log("Actualizare stream local în effect");
      localVideoRef.current.srcObject = localStream;

      // Forțează redarea (poate fi necesară în unele browsere)
      localVideoRef.current
        .play()
        .catch((e) =>
          console.error("Eroare la redarea video local în effect:", e)
        );
    }

    // Verificăm și forțăm atribuirea tuturor stream-urilor remote
    Object.entries(remoteStreams).forEach(([peerId, stream]) => {
      const videoElement = remoteVideoRefs.current[peerId];
      if (videoElement && videoElement.srcObject !== stream) {
        console.log(`Actualizare stream pentru ${peerId} în effect`);
        videoElement.srcObject = stream;

        // Forțează redarea (poate fi necesară în unele browsere)
        videoElement
          .play()
          .catch((e) =>
            console.error(
              `Eroare la redarea video pentru ${peerId} în effect:`,
              e
            )
          );
      }
    });
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
    const newState = !videoEnabled;
    setVideoEnabled(newState);
    toggleTrack("video", newState);
  };

  // Toggle audio
  const handleToggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    toggleTrack("audio", newState);
  };

  // Toggle screen sharing
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenShareStream) {
        screenShareStream.getTracks().forEach((track) => track.stop());
        setScreenShareStream(null);
      }
      setIsScreenSharing(false);
    } else {
      try {
        // Start screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        // Handle the user canceling the share
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setScreenShareStream(null);
        };

        setScreenShareStream(stream);
        setIsScreenSharing(true);
      } catch (error) {
        console.error("Error sharing screen:", error);
      }
    }
  };

  // End call
  const handleEndCall = async () => {
    // Stop screen sharing if active
    if (screenShareStream) {
      screenShareStream.getTracks().forEach((track) => track.stop());
    }

    // Leave the room
    await leaveRoom();

    // Notify parent component
    onLeave();
  };

  // Send chat message
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (messageInput.trim()) {
      const newMessage: ChatMessageType = {
        sender: userName,
        text: messageInput,
        time: new Date(),
        isLocal: true,
      };

      setChatMessages((prev) => [...prev, newMessage]);
      setMessageInput("");

      // În implementarea reală, trimite acest mesaj și în Firestore
    }
  };

  // Comută fixarea unui participant
  const togglePinParticipant = (participantId: string) => {
    if (pinnedParticipant === participantId) {
      setPinnedParticipant(null);
      setLayoutMode("grid");
    } else {
      setPinnedParticipant(participantId);
      setLayoutMode("focus");
    }
  };

  // Schimbă diapozitivul curent în modul galerie
  const changeSlide = (direction: "next" | "prev") => {
    if (direction === "next" && currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    } else if (direction === "prev" && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const setVideoRef = (
    el: HTMLVideoElement | null,
    isLocal: boolean,
    participantId: string
  ) => {
    if (!el) return;

    // Configurare avansată pentru a gestiona stream-urile
    const setupVideoElement = async (stream: MediaStream | null) => {
      if (!stream) return;

      try {
        // Oprește orice redare curentă
        el.pause();
        el.currentTime = 0;

        // Configurează noul stream
        el.srcObject = stream;

        // Opțiuni suplimentare pentru redare
        el.autoplay = true;
        el.playsInline = true;
        el.muted = isLocal;

        // Încercări multiple de redare
        const playWithRetry = async (retries = 3) => {
          try {
            await el.play();
          } catch (error) {
            if (retries > 0 && error instanceof DOMException) {
              console.warn(`Reîncercare redare video (${retries} rămase)...`);
              await new Promise((resolve) => setTimeout(resolve, 200));
              await playWithRetry(retries - 1);
            } else {
              console.error("Eroare persistentă la redarea video:", error);
            }
          }
        };

        await playWithRetry();
      } catch (error) {
        console.error("Eroare la configurarea elementului video:", error);
      }
    };

    if (isLocal) {
      localVideoRef.current = el;
      setupVideoElement(localStream);
    } else {
      remoteVideoRefs.current[participantId] = el;
      setupVideoElement(remoteStreams[participantId]);
    }
  };

  // Obține elementele pentru "barul" de participanți neselectați
  const renderUnselectedParticipantsBar = () => {
    if (unselectedParticipants.length === 0) {
      return null;
    }

    return (
      <div className="absolute bottom-20 left-0 right-0 bg-gray-900 bg-opacity-80 p-2 flex items-center justify-center space-x-2 overflow-x-auto">
        {unselectedParticipants.map((participant) => (
          <div
            key={participant.id}
            className="flex flex-col items-center cursor-pointer hover:bg-gray-800 p-2 rounded-lg"
            onClick={() => selectParticipantStream(participant.id, true)}
          >
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 mb-1">
              {participant.userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-white truncate max-w-[60px]">
              {participant.userName}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Funcție pentru a afișa butoanele de control pentru galerie
  const renderGalleryControls = () => {
    if (layoutMode !== "gallery" || totalSlides <= 1) {
      return null;
    }

    return (
      <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4">
        <button
          onClick={() => changeSlide("prev")}
          disabled={currentSlide === 0}
          className={`p-2 rounded-full bg-gray-800 text-white 
            ${
              currentSlide === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-700"
            }`}
          type="button"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => changeSlide("next")}
          disabled={currentSlide >= totalSlides - 1}
          className={`p-2 rounded-full bg-gray-800 text-white 
            ${
              currentSlide >= totalSlides - 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-700"
            }`}
          type="button"
        >
          <ChevronRight size={24} />
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
          className={`p-2 rounded-lg ${
            layoutMode === "grid"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-300"
          }`}
          type="button"
        >
          <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
            <div className="bg-current rounded-sm"></div>
            <div className="bg-current rounded-sm"></div>
            <div className="bg-current rounded-sm"></div>
            <div className="bg-current rounded-sm"></div>
          </div>
        </button>
        <button
          onClick={() => setLayoutMode("gallery")}
          className={`p-2 rounded-lg ${
            layoutMode === "gallery"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-300"
          }`}
          type="button"
        >
          <Monitor size={20} />
        </button>
      </div>
    );
  };

  // Funcție pentru a afișa componenta participant
  const renderParticipant = (
    participant: ParticipantType & { isLocal?: boolean },
    index: number
  ) => {
    const isLocal = participant.id === "local" || participant.isLocal;
    const isPinned = pinnedParticipant === participant.id;
    const stream = isLocal ? localStream : remoteStreams[participant.id];

    return (
      <div
        key={participant.id}
        className={`relative bg-gray-800 rounded-lg overflow-hidden
          ${isPinned ? "col-span-full row-span-full" : ""}
          ${layoutMode === "focus" && !isPinned ? "hidden" : ""}
        `}
      >
        {/* Video de la participanți */}
        {stream ? (
          <video
            ref={(el) => setVideoRef(el, isLocal, participant.id)}
            autoPlay
            playsInline
            muted={isLocal} // Dezactivează sunetul pentru videoul local
            className="w-full h-full object-cover"
            onLoadedMetadata={(e) => {
              // Asigură redarea după încărcarea metadatelor
              const video = e.currentTarget;
              video
                .play()
                .catch((err) =>
                  console.error("Eroare la redare după metadata:", err)
                );
            }}
          ></video>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-2xl">
              {participant.userName.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Indicatori pentru audio și video */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
          <div className="bg-black bg-opacity-60 px-2 py-1 rounded text-white text-sm">
            {participant.userName} {isLocal ? "(Tu)" : ""}
            {participant.isHost && (
              <span className="ml-1 text-blue-400">(Gazdă)</span>
            )}
          </div>

          <div className="flex space-x-1">
            {/* Pentru utilizatorul local, verificăm starea efectivă */}
            {isLocal && (
              <>
                {!audioEnabled && (
                  <div className="bg-red-600 p-1 rounded-full">
                    <MicOff size={14} className="text-white" />
                  </div>
                )}
                {!videoEnabled && (
                  <div className="bg-red-600 p-1 rounded-full">
                    <VideoOff size={14} className="text-white" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Buton pentru fixare/defixare */}
        <button
          onClick={() => togglePinParticipant(participant.id)}
          className="absolute top-2 right-2 p-1 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
          type="button"
        >
          {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
        </button>
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

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Antet */}
        <div className="bg-gray-800 py-2 px-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-white font-semibold">
              Conferință TeamSync
            </span>
            {roomId && (
              <div className="ml-4 bg-gray-700 px-3 py-1 rounded text-sm text-gray-300 flex items-center">
                <span className="mr-2">Camera: {roomId}</span>
                <button
                  onClick={copyRoomId}
                  className="text-blue-400 hover:text-blue-300"
                  type="button"
                >
                  Copiază
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className={`p-2 rounded-full ${
                showParticipants
                  ? "bg-blue-600"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
              type="button"
            >
              <Users size={20} />
            </button>
            <button
              onClick={() => setInviteModalOpen(true)}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700"
              type="button"
            >
              <UserPlus size={20} />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700"
              type="button"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2 rounded-full ${
                showChat
                  ? "bg-blue-600"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
              type="button"
            >
              <MessageSquare size={20} />
            </button>
          </div>
        </div>

        {/* Conținut principal */}
        <div className="flex-grow flex overflow-hidden">
          {/* Grilă de participanți */}
          <div
            ref={containerRef}
            className="relative flex-grow p-4 overflow-auto"
          >
            <div className={`grid gap-4 h-full`} style={gridStyles}>
              {visibleParticipants.map((p, index) =>
                renderParticipant(p, index)
              )}
            </div>

            {renderUnselectedParticipantsBar()}
            {renderGalleryControls()}
            {renderLayoutControls()}
          </div>

          {/* Participant sidebar */}
          {showParticipants && (
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
              <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-white font-medium">
                  Participanți ({participants.length + 1})
                </h3>
                <button
                  onClick={() => setShowParticipants(false)}
                  className="text-gray-400 hover:text-white"
                  type="button"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-grow p-3 overflow-y-auto">
                <ul className="space-y-2">
                  {/* Utilizatorul curent (întotdeauna primul) */}
                  <li className="flex items-center justify-between p-2 rounded-lg bg-gray-700">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="ml-2 text-white">{userName} (Tu)</span>
                      {isHost && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs text-blue-300 border border-blue-600 rounded">
                          Gazdă
                        </span>
                      )}
                    </div>
                  </li>

                  {/* Ceilalți participanți */}
                  {participants.map((participant) => {
                    const isSelected = selectedParticipants.includes(
                      participant.id
                    );

                    return (
                      <li
                        key={participant.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium">
                            {participant.userName.charAt(0).toUpperCase()}
                          </div>
                          <span className="ml-2 text-white">
                            {participant.userName}
                          </span>
                          {participant.isHost && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs text-blue-300 border border-blue-600 rounded">
                              Gazdă
                            </span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={() =>
                              selectParticipantStream(
                                participant.id,
                                !isSelected
                              )
                            }
                            className={`p-1 rounded ${
                              isSelected
                                ? "bg-green-600 text-white"
                                : "bg-gray-600 text-gray-300"
                            }`}
                            type="button"
                          >
                            {isSelected ? "Activat" : "Inactiv"}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          {/* Chat sidebar */}
          {showChat && (
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
              <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-white font-medium">Chat</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-white"
                  type="button"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-grow p-3 overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    Niciun mesaj
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          msg.isLocal ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 ${
                            msg.isLocal
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-white"
                          }`}
                        >
                          <div className="text-xs mb-1">
                            <span className="font-medium">{msg.sender}</span>
                            <span className="ml-2 text-opacity-70">
                              {new Date(msg.time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div>{msg.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form
                onSubmit={sendMessage}
                className="p-3 border-t border-gray-700"
              >
                <div className="flex">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-grow bg-gray-700 border-none rounded-l-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Scrie un mesaj..."
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white rounded-r-lg px-3 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    Trimite
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Modal pentru invitație */}
          {inviteModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-20">
              <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-white">
                    Invită participanți
                  </h3>
                  <button
                    onClick={() => setInviteModalOpen(false)}
                    className="text-gray-400 hover:text-white"
                    type="button"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6">
                  <p className="text-gray-300 mb-4">
                    Partajează acest ID al camerei cu persoanele pe care dorești
                    să le inviți:
                  </p>

                  <div className="flex mb-6">
                    <input
                      type="text"
                      readOnly
                      value={roomId || ""}
                      className="flex-grow p-2 border border-gray-600 rounded-l-lg bg-gray-700 text-white"
                    />
                    <button
                      onClick={copyRoomId}
                      className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                      type="button"
                    >
                      Copiază
                    </button>
                  </div>

                  <button
                    onClick={() => setInviteModalOpen(false)}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    type="button"
                  >
                    Închide
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal pentru setări */}
          {showSettings && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-20">
              <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-white">Setări</h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-400 hover:text-white"
                    type="button"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-white text-lg mb-3">Audio și Video</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 mb-2">
                          Dispozitiv cameră
                        </label>
                        <select className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                          <option>Camera web integrată</option>
                          <option>Camera externă</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">
                          Dispozitiv microfon
                        </label>
                        <select className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                          <option>Microfon integrat</option>
                          <option>Căști cu microfon</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">
                          Dispozitiv audio
                        </label>
                        <select className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                          <option>Difuzoare integrate</option>
                          <option>Căști</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white text-lg mb-3">Interfață</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="darkMode"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                          defaultChecked
                        />
                        <label
                          htmlFor="darkMode"
                          className="ml-2 text-gray-300"
                        >
                          Mod întunecat
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="hideParticipantsWithDisabledVideo"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                        />
                        <label
                          htmlFor="hideParticipantsWithDisabledVideo"
                          className="ml-2 text-gray-300"
                        >
                          Ascunde participanții cu camera dezactivată
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controale */}
        <div className="bg-gray-800 py-3 px-6 flex justify-center">
          <div className="flex space-x-4">
            <button
              onClick={handleToggleAudio}
              className={`p-3 rounded-full ${
                audioEnabled
                  ? "bg-gray-700 text-white"
                  : "bg-red-600 text-white"
              }`}
              type="button"
            >
              {audioEnabled ? <Mic size={22} /> : <MicOff size={22} />}
            </button>
            <button
              onClick={handleToggleVideo}
              className={`p-3 rounded-full ${
                videoEnabled
                  ? "bg-gray-700 text-white"
                  : "bg-red-600 text-white"
              }`}
              type="button"
            >
              {videoEnabled ? <Video size={22} /> : <VideoOff size={22} />}
            </button>
            <button
              onClick={handleToggleScreenShare}
              className={`p-3 rounded-full ${
                isScreenSharing
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-white"
              }`}
              type="button"
            >
              <ScreenShare size={22} />
            </button>
            <button
              onClick={handleEndCall}
              className="p-3 rounded-full bg-red-600 text-white"
              type="button"
            >
              <PhoneOff size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConferenceView;
