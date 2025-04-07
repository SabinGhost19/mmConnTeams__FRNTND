// File: JoinView.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { WebRTCHookReturn } from "@/app/hooks/useWebRTC";

interface JoinViewProps {
  userName: string;
  initialRoomId?: string;
  webRTC: WebRTCHookReturn;
  onJoined: () => void;
}

const JoinView: React.FC<JoinViewProps> = ({
  userName,
  initialRoomId,
  webRTC,
  onJoined,
}) => {
  const { localStream, initializeMedia, createRoom, joinRoom } = webRTC;

  const [roomIdToJoin, setRoomIdToJoin] = useState<string>(initialRoomId || "");
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [isAudioOnly, setIsAudioOnly] = useState<boolean>(false);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const hasInitializedRef = useRef<boolean>(false);

  // Initialize media when component mounts
  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitializedRef.current) return;

    const initialize = async () => {
      setIsInitializing(true);
      try {
        const audioOnly = await initializeMedia(videoEnabled, audioEnabled);
        setIsAudioOnly(audioOnly);
        hasInitializedRef.current = true;
        setIsInitializing(false);

        // If we're in audio-only mode, show a message to the user
        if (audioOnly) {
          setError(
            "Your camera is in use by another application or browser window. You can continue with audio only, or close other applications using the camera and refresh the page."
          );
          setShowErrorModal(true);
          setVideoEnabled(false); // Auto-disable video UI since we're in audio-only mode

          // Add a delay before joining to ensure user understands they're in audio-only mode
          setTimeout(() => {
            setShowErrorModal(false);
          }, 5000);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Could not access camera or microphone. Please check permissions.";
        setError(errorMessage);
        setShowErrorModal(true);
        setIsInitializing(false);
        console.error(err);
      }
    };

    initialize();
  }, []); // Removed dependencies to prevent re-initialization

  // Handle changes to video/audio enabled state after initial setup
  useEffect(() => {
    if (hasInitializedRef.current && localStream) {
      // Only update tracks if we've already initialized
      webRTC.toggleTrack("video", videoEnabled);
      webRTC.toggleTrack("audio", audioEnabled);
    }
  }, [videoEnabled, audioEnabled, localStream, webRTC]);

  // Set local video stream
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Handle toggle video - use useCallback to prevent function recreation
  const toggleVideo = useCallback(() => {
    setVideoEnabled((prev) => !prev);
  }, []);

  // Handle toggle audio - use useCallback to prevent function recreation
  const toggleAudio = useCallback(() => {
    setAudioEnabled((prev) => !prev);
  }, []);

  // Handle form submission to create or join room
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!localStream) {
        setError(
          "Camera and microphone not initialized. Please refresh and try again."
        );
        return;
      }

      if (isJoining) return; // Prevent multiple submissions

      setIsJoining(true);
      setError(null);

      try {
        if (initialRoomId || roomIdToJoin) {
          // Join existing room
          await joinRoom(initialRoomId || roomIdToJoin, userName);
        } else {
          // Create new room
          await createRoom(userName);
        }

        onJoined();
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";

        setError(errorMessage);
        console.error(err);
      } finally {
        setIsJoining(false);
      }
    },
    [
      localStream,
      initialRoomId,
      roomIdToJoin,
      userName,
      joinRoom,
      createRoom,
      onJoined,
      isJoining,
    ]
  );

  // Handle retry with video
  const handleRetryWithVideo = async () => {
    setRetryCount((prev) => prev + 1);
    setIsInitializing(true);
    setShowErrorModal(false);

    try {
      // Stop existing tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      // Try again with video
      const audioOnly = await initializeMedia(true, audioEnabled);
      setIsAudioOnly(audioOnly);
      setIsInitializing(false);

      if (audioOnly) {
        setError(
          "Camera is still in use by another application. You can continue with audio only, or close other applications using the camera and refresh the page."
        );
        setShowErrorModal(true);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Could not access camera or microphone. Please check permissions.";
      setError(errorMessage);
      setShowErrorModal(true);
      setIsInitializing(false);
      console.error(err);
    }
  };

  // Error modal component
  const ErrorModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">Connection Information</h3>
        <p className="mb-6">{error}</p>
        {isAudioOnly && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg">
            <p className="font-medium mb-2">Testing with Multiple Browsers?</p>
            <p className="text-sm">
              Your camera is already in use (likely by another browser window).
              You're now in audio-only mode, which works fine for testing with
              multiple browsers.
            </p>
          </div>
        )}
        <div className="flex justify-end space-x-4">
          {isAudioOnly && retryCount < 3 && (
            <button
              onClick={handleRetryWithVideo}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry with Video
            </button>
          )}
          <button
            onClick={() => setShowErrorModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Continue {isAudioOnly ? "with Audio Only" : ""}
          </button>
        </div>
      </div>
    </div>
  );

  // Determine if join button should be disabled
  const isJoinButtonDisabled =
    isInitializing || isJoining || (!localStream && !error);

  return (
    <div className="flex flex-col h-full">
      {/* Error modal */}
      {showErrorModal && <ErrorModal />}

      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white flex flex-col">
        <div className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Join Conference
              </h2>

              {isAudioOnly && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Audio-only mode (camera in use)</span>
                </div>
              )}

              {error && !isAudioOnly && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <div className="bg-black rounded-lg overflow-hidden aspect-video mb-4">
                  {isInitializing ? (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <p>Camera initializing...</p>
                    </div>
                  ) : localStream ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    ></video>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <p>No camera access</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-center space-x-4 mb-6">
                  <button
                    type="button"
                    onClick={toggleAudio}
                    className={`p-3 rounded-full ${
                      audioEnabled
                        ? "bg-gray-200 text-gray-800"
                        : "bg-red-500 text-white"
                    }`}
                    disabled={isInitializing || !localStream}
                  >
                    {audioEnabled ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={toggleVideo}
                    className={`p-3 rounded-full ${
                      videoEnabled
                        ? "bg-gray-200 text-gray-800"
                        : "bg-red-500 text-white"
                    }`}
                    disabled={isInitializing || !localStream}
                  >
                    {videoEnabled ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect
                          x="1"
                          y="5"
                          width="15"
                          height="14"
                          rx="2"
                          ry="2"
                        ></rect>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                        <path d="M21 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14"></path>
                        <path d="M3.51 8.72L21 21"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="roomId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Room ID
                  </label>
                  <input
                    type="text"
                    id="roomId"
                    value={roomIdToJoin}
                    onChange={(e) => setRoomIdToJoin(e.target.value)}
                    placeholder="Enter room ID to join existing room"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Leave empty to create a new room
                  </p>
                </div>

                <div className="flex justify-between">
                  <button
                    type="submit"
                    className={`
                      bg-blue-600 text-white py-2 px-4 rounded-lg
                      ${
                        !isJoinButtonDisabled
                          ? "hover:bg-blue-700"
                          : "opacity-50 cursor-not-allowed"
                      }
                    `}
                    disabled={isJoinButtonDisabled}
                  >
                    {isJoining
                      ? "Connecting..."
                      : roomIdToJoin
                      ? "Join Room"
                      : "Create Room"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinView;
