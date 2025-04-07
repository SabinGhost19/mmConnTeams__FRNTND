"use client";

import { useState, useEffect, useRef } from "react";
import useWebRTC from "@/app/hooks/useWebRTC";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

interface StreamPageProps {
  params: {
    roomId?: string;
  };
}

export default function StreamPage({ params }: StreamPageProps) {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [audioOnlyMode, setAudioOnlyMode] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<Record<string, HTMLVideoElement>>({});

  const {
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
  } = useWebRTC();

  // Handle media initialization
  useEffect(() => {
    const initMedia = async () => {
      try {
        const audioOnly = await initializeMedia(true, true);
        setAudioOnlyMode(audioOnly);

        if (audioOnly) {
          setError(
            "Camera is in use by another application. You can continue with audio only, or close other applications using the camera and refresh the page."
          );
          setShowErrorModal(true);
        }
      } catch (error: any) {
        console.error("Error initializing media:", error);

        // Check if it's a camera in use error
        if (
          error instanceof DOMException &&
          (error.name === "NotReadableError" || error.name === "AbortError")
        ) {
          setError(
            "Camera is being used by another application. You can continue with audio only."
          );
          setAudioOnlyMode(true);
          setShowErrorModal(true);

          // Try with audio only
          try {
            await initializeMedia(false, true);
            setError("Connected with audio only. Video is disabled.");
          } catch (audioError: any) {
            setError(
              "Failed to access camera or microphone. Please check your device permissions."
            );
          }
        } else if (
          error instanceof DOMException &&
          error.name === "NotAllowedError"
        ) {
          setError(
            "Permission denied. Please allow access to your camera and microphone."
          );
          setShowErrorModal(true);
        } else {
          setError("Failed to access camera or microphone");
          setShowErrorModal(true);
        }
      }
    };

    if (!localStream) {
      initMedia();
    }
  }, [initializeMedia, localStream]);

  // Handle local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream as unknown as MediaProvider;
    }
  }, [localStream]);

  // Handle remote video streams
  useEffect(() => {
    Object.entries(remoteStreams).forEach(([peerId, stream]) => {
      const existingVideo = remoteVideosRef.current[peerId];

      if (existingVideo) {
        // Update existing video element if stream has changed
        if (existingVideo.srcObject !== stream) {
          existingVideo.srcObject = stream as unknown as MediaProvider;
        }
      } else {
        // Create a new video element
        const video = document.createElement("video");
        video.autoplay = true;
        video.playsInline = true;
        video.srcObject = stream as unknown as MediaProvider;

        // Add error handling for video playback
        video.onloadedmetadata = () => {
          video.play().catch((err) => {
            console.warn("Auto-play prevented:", err);
            // Add a play button or visual indicator here if needed
          });
        };

        remoteVideosRef.current[peerId] = video;
      }
    });
  }, [remoteStreams]);

  // Handle room joining
  useEffect(() => {
    if (params.roomId && !roomId && !isJoining && localStream) {
      setIsJoining(true);
      joinRoom(
        params.roomId,
        userName || `User-${Math.floor(Math.random() * 1000)}`
      )
        .catch((error: any) => {
          console.error("Error joining room:", error);
          setError(
            "Failed to join room: " +
              (error instanceof Error ? error.message : "Unknown error")
          );
          setShowErrorModal(true);
        })
        .finally(() => {
          setIsJoining(false);
        });
    }
  }, [params.roomId, roomId, userName, joinRoom, isJoining, localStream]);

  // Toggle audio/video functions
  const handleToggleVideo = () => {
    if (audioOnlyMode) {
      setError(
        "Video is disabled because your camera is in use by another application"
      );
      setShowErrorModal(true);
      return;
    }

    toggleTrack("video", !localStream?.getVideoTracks()[0]?.enabled);
  };

  const handleToggleAudio = () => {
    toggleTrack("audio", !localStream?.getAudioTracks()[0]?.enabled);
  };

  // Retry with video
  const retryWithVideo = async () => {
    try {
      await initializeMedia(true, true);
      setAudioOnlyMode(false);
      setError(null);
      setShowErrorModal(false);
    } catch (error: any) {
      console.error("Error retrying with video:", error);
      setError(
        "Still cannot access camera. Please try closing other applications that might be using it."
      );
    }
  };

  // Error modal component
  const ErrorModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
        <h3 className="text-xl font-semibold text-white mb-4">
          Connection Issue
        </h3>
        <p className="text-gray-200 mb-6">{error}</p>
        <div className="flex flex-col space-y-2">
          {audioOnlyMode && (
            <button
              onClick={retryWithVideo}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Retry with Video
            </button>
          )}
          <button
            onClick={() => setShowErrorModal(false)}
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );

  // Loading indicator
  if (!localStream || isJoining) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {isJoining ? "Joining room..." : "Initializing media..."}
          </p>
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Error modal */}
      {showErrorModal && <ErrorModal />}

      <main className="flex-1 relative">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold mb-4">Join or Create a Stream</h1>
          <div className="w-full max-w-md space-y-4">
            <input
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <div className="flex space-x-4">
              <button
                onClick={() => router.push("/")}
                className="flex-1 p-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Leave Room
              </button>
            </div>
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </div>
      </main>

      {/* Media controls */}
      <div className="bg-gray-800 p-4 flex justify-center">
        <div className="flex space-x-4">
          <button
            onClick={handleToggleAudio}
            className={`p-3 rounded-full ${
              localStream?.getAudioTracks()[0]?.enabled
                ? "bg-gray-700 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {localStream?.getAudioTracks()[0]?.enabled ? <Mic /> : <MicOff />}
          </button>
          <button
            onClick={handleToggleVideo}
            className={`p-3 rounded-full ${
              audioOnlyMode
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : localStream?.getVideoTracks()[0]?.enabled
                ? "bg-gray-700 text-white"
                : "bg-red-600 text-white"
            }`}
            disabled={audioOnlyMode}
          >
            {localStream?.getVideoTracks()[0]?.enabled ? (
              <Video />
            ) : (
              <VideoOff />
            )}
          </button>
          <button
            onClick={() => router.push("/")}
            className="p-3 rounded-full bg-red-600 text-white"
          >
            <PhoneOff />
          </button>
        </div>
      </div>
    </div>
  );
}
