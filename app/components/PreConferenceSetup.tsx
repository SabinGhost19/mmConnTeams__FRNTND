"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, Settings, Volume2 } from "lucide-react";

// Define type for device status
type DeviceStatus = "pending" | "granted" | "denied" | "disabled";

// Define props interface
interface PreConferenceSetupProps {
  onJoin: (
    userName: string,
    roomId: string,
    devices: { camera: string; microphone: string },
    media: { video: boolean; audio: boolean }
  ) => void;
  roomIdToJoin?: string;
}

// Define device permission status interface
interface DevicePermissionStatus {
  camera: DeviceStatus;
  microphone: DeviceStatus;
}

const PreConferenceSetup: React.FC<PreConferenceSetupProps> = ({
  onJoin,
  roomIdToJoin = "",
}) => {
  const [activeTab, setActiveTab] = useState<string>("audioVideo");
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [devicePermissionStatus, setDevicePermissionStatus] =
    useState<DevicePermissionStatus>({
      camera: "pending",
      microphone: "pending",
    });
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [microphoneDevices, setMicrophoneDevices] = useState<MediaDeviceInfo[]>(
    []
  );
  const [meetingName, setMeetingName] = useState<string>("Conference");
  const [userName, setUserName] = useState<string>("User");
  const [isReady, setIsReady] = useState<boolean>(false);
  const [roomInputValue, setRoomInputValue] = useState<string>(
    roomIdToJoin || ""
  );
  const [error, setError] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Effect to check if user is ready to join
  useEffect(() => {
    // A more reliable way to determine if the user is ready to join
    const videoReady =
      !videoEnabled || devicePermissionStatus.camera === "granted";
    const audioReady =
      !audioEnabled || devicePermissionStatus.microphone === "granted";

    // The user needs valid name, and appropriate media permissions
    setIsReady(videoReady && audioReady && userName.trim().length > 0);
  }, [videoEnabled, audioEnabled, devicePermissionStatus, userName]);

  // Effect to setup devices
  useEffect(() => {
    // Request permissions and enumerate devices
    const setupDevices = async () => {
      try {
        // Only request media types that are enabled
        const constraints: MediaStreamConstraints = {
          video: videoEnabled,
          audio: audioEnabled,
        };

        // Request access to camera and microphone
        const stream = await navigator.mediaDevices
          .getUserMedia(constraints)
          .catch(async (error) => {
            // If requesting both video and audio failed, try just audio
            if (
              (videoEnabled &&
                audioEnabled &&
                error.name === "NotReadableError") ||
              error.name === "AbortError"
            ) {
              console.warn("Failed to get camera+mic, trying audio only");
              // Try with audio only if both were requested
              const audioOnlyStream = await navigator.mediaDevices
                .getUserMedia({
                  audio: true,
                  video: false,
                })
                .catch((e) => {
                  console.error("Failed to get audio-only stream:", e);
                  return null;
                });

              if (audioOnlyStream) {
                // Update permission status for fallback
                setDevicePermissionStatus({
                  camera: "denied", // Mark camera as denied since we couldn't access it
                  microphone: "granted",
                });

                // Update UI state
                setVideoEnabled(false);

                // Show a helpful message to the user
                setError(
                  "Camera is in use by another application. You can continue with audio only, or close other applications using the camera and refresh the page."
                );

                return audioOnlyStream;
              }
              return null;
            }
            throw error; // Re-throw if it's not a case we can handle
          });

        // If stream is null (all attempts failed), handle accordingly
        if (!stream) {
          throw new DOMException(
            "Could not access any media devices",
            "NotAllowedError"
          );
        }

        localStreamRef.current = stream;

        if (
          videoRef.current &&
          videoEnabled &&
          stream.getVideoTracks().length > 0
        ) {
          videoRef.current.srcObject = stream;
        }

        // Update permission status based on what tracks we actually got
        setDevicePermissionStatus({
          camera: stream.getVideoTracks().length > 0 ? "granted" : "denied",
          microphone: stream.getAudioTracks().length > 0 ? "granted" : "denied",
        });

        // Get available devices
        const devices = await navigator.mediaDevices.enumerateDevices();

        const cameras = devices.filter(
          (device) => device.kind === "videoinput"
        );
        const microphones = devices.filter(
          (device) => device.kind === "audioinput"
        );

        setCameraDevices(cameras);
        setMicrophoneDevices(microphones);

        if (cameras.length > 0 && videoEnabled) {
          setSelectedCamera(cameras[0].deviceId);
        }

        if (microphones.length > 0 && audioEnabled) {
          setSelectedMicrophone(microphones[0].deviceId);
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);

        // Provide more specific error handling based on the error type
        if (error instanceof DOMException) {
          if (
            error.name === "NotReadableError" ||
            error.name === "AbortError"
          ) {
            // This usually means the camera is already in use by another application
            console.warn(
              "Camera is likely already in use by another application"
            );
            setDevicePermissionStatus({
              camera: "denied",
              microphone: audioEnabled ? "pending" : "disabled",
            });

            // Try to get audio-only for testing with multiple browsers
            if (audioEnabled) {
              try {
                const audioOnlyStream =
                  await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                  });

                localStreamRef.current = audioOnlyStream;

                setVideoEnabled(false);
                setDevicePermissionStatus((prev) => ({
                  ...prev,
                  camera: "denied",
                  microphone: "granted",
                }));

                // Show a helpful message to the user
                setError(
                  "Camera is in use by another application. You can continue with audio only, or close other applications using the camera and refresh the page."
                );
              } catch (audioError) {
                console.error("Error getting audio-only stream:", audioError);
                setDevicePermissionStatus((prev) => ({
                  ...prev,
                  microphone: "denied",
                }));

                // Show a more specific error message
                if (audioError instanceof DOMException) {
                  if (audioError.name === "NotAllowedError") {
                    setError(
                      "Microphone access denied. Please allow microphone access to continue."
                    );
                  } else if (audioError.name === "NotFoundError") {
                    setError(
                      "No microphone found. Please connect a microphone and try again."
                    );
                  } else {
                    setError(
                      "Could not access microphone. Please check your device permissions."
                    );
                  }
                } else {
                  setError(
                    "Could not access any media devices. Please check your device permissions."
                  );
                }
              }
            } else {
              setError(
                "Camera is in use by another application. Please close other applications using the camera and refresh the page."
              );
            }
          } else if (error.name === "NotAllowedError") {
            // User denied permission
            setDevicePermissionStatus({
              camera: videoEnabled ? "denied" : "disabled",
              microphone: audioEnabled ? "denied" : "disabled",
            });
            setError(
              "Camera and microphone access denied. Please allow access to continue."
            );
          } else if (error.name === "NotFoundError") {
            // No media devices available
            setDevicePermissionStatus({
              camera: videoEnabled ? "denied" : "disabled",
              microphone: audioEnabled ? "denied" : "disabled",
            });
            setError(
              "No camera or microphone found. Please connect devices and try again."
            );
          } else {
            // Other errors
            setDevicePermissionStatus({
              camera: videoEnabled ? "denied" : "disabled",
              microphone: audioEnabled ? "denied" : "disabled",
            });
            setError(
              "Could not access media devices. Please check your device permissions."
            );
          }
        } else {
          // Generic error handling
          setDevicePermissionStatus({
            camera: videoEnabled ? "denied" : "disabled",
            microphone: audioEnabled ? "denied" : "disabled",
          });
          setError(
            "Could not access media devices. Please check your device permissions."
          );
        }
      }
    };

    setupDevices();

    // Cleanup function to stop all tracks when component unmounts
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoEnabled, audioEnabled]);

  const toggleVideo = async () => {
    const newVideoState = !videoEnabled;
    setVideoEnabled(newVideoState);

    if (localStreamRef.current) {
      // Stop all video tracks if turning off
      if (videoEnabled) {
        localStreamRef.current
          .getVideoTracks()
          .forEach((track) => track.stop());
        setDevicePermissionStatus((prev) => ({
          ...prev,
          camera: "disabled",
        }));
      } else {
        // Request video again if turning on
        try {
          const newStream = await navigator.mediaDevices
            .getUserMedia({
              video: true,
            })
            .catch((error) => {
              // Handle errors specifically for camera already in use
              if (
                error.name === "NotReadableError" ||
                error.name === "AbortError"
              ) {
                console.warn(
                  "Camera is likely already in use by another application"
                );
                throw new DOMException(
                  "Camera is in use by another application",
                  "AbortError"
                );
              }
              throw error;
            });

          if (!newStream) {
            throw new Error("Failed to get video stream");
          }

          const videoTrack = newStream.getVideoTracks()[0];

          // Make sure we have a valid stream reference
          if (!localStreamRef.current) {
            localStreamRef.current = new MediaStream();
          }

          localStreamRef.current.addTrack(videoTrack);

          if (videoRef.current) {
            videoRef.current.srcObject = localStreamRef.current;
          }

          setDevicePermissionStatus((prev) => ({
            ...prev,
            camera: "granted",
          }));
        } catch (error) {
          console.error("Error enabling video:", error);

          // Show a helpful message about camera already in use
          if (
            error instanceof DOMException &&
            (error.name === "NotReadableError" || error.name === "AbortError")
          ) {
            alert(
              "Camera is already in use by another application. For testing with two browsers, please use audio only in one of them."
            );
          }

          setDevicePermissionStatus((prev) => ({
            ...prev,
            camera: "denied",
          }));

          // Revert the UI state since we couldn't enable video
          setVideoEnabled(false);
        }
      }
    }
  };

  const toggleAudio = async () => {
    const newAudioState = !audioEnabled;
    setAudioEnabled(newAudioState);

    if (localStreamRef.current) {
      // Stop all audio tracks if turning off
      if (audioEnabled) {
        localStreamRef.current
          .getAudioTracks()
          .forEach((track) => track.stop());
        setDevicePermissionStatus((prev) => ({
          ...prev,
          microphone: "disabled",
        }));
      } else {
        // Request audio again if turning on
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          const audioTrack = newStream.getAudioTracks()[0];

          // Make sure we have a valid stream reference
          if (!localStreamRef.current) {
            localStreamRef.current = new MediaStream();
          }

          localStreamRef.current.addTrack(audioTrack);

          setDevicePermissionStatus((prev) => ({
            ...prev,
            microphone: "granted",
          }));
        } catch (error) {
          console.error("Error enabling audio:", error);
          setDevicePermissionStatus((prev) => ({
            ...prev,
            microphone: "denied",
          }));
        }
      }
    }
  };

  const changeCamera = async (deviceId: string) => {
    setSelectedCamera(deviceId);

    if (localStreamRef.current && videoEnabled) {
      // Stop current video tracks
      localStreamRef.current.getVideoTracks().forEach((track) => track.stop());

      // Get new video track with selected device
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId } },
        });

        const videoTrack = newStream.getVideoTracks()[0];

        // Replace the track in the existing stream
        const existingTrack = localStreamRef.current.getVideoTracks()[0];
        if (existingTrack) {
          localStreamRef.current.removeTrack(existingTrack);
        }

        localStreamRef.current.addTrack(videoTrack);

        if (videoRef.current) {
          videoRef.current.srcObject = localStreamRef.current;
        }
      } catch (error) {
        console.error("Error changing camera:", error);
      }
    }
  };

  const changeMicrophone = async (deviceId: string) => {
    setSelectedMicrophone(deviceId);

    if (localStreamRef.current && audioEnabled) {
      // Stop current audio tracks
      localStreamRef.current.getAudioTracks().forEach((track) => track.stop());

      // Get new audio track with selected device
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } },
        });

        const audioTrack = newStream.getAudioTracks()[0];

        // Replace the track in the existing stream
        const existingTrack = localStreamRef.current.getAudioTracks()[0];
        if (existingTrack) {
          localStreamRef.current.removeTrack(existingTrack);
        }

        localStreamRef.current.addTrack(audioTrack);
      } catch (error) {
        console.error("Error changing microphone:", error);
      }
    }
  };

  const handleJoinConference = () => {
    // Stop all tracks first to avoid duplicate streams when joined
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Pass selected devices and media state to parent component
    onJoin(
      userName,
      roomInputValue,
      {
        camera: selectedCamera,
        microphone: selectedMicrophone,
      },
      {
        video: videoEnabled,
        audio: audioEnabled,
      }
    );
  };

  const getPermissionStatusIcon = (status: DeviceStatus) => {
    switch (status) {
      case "granted":
        return <span className="text-green-500">✓</span>;
      case "denied":
        return <span className="text-red-500">✗</span>;
      case "pending":
        return <span className="animate-pulse">...</span>;
      default:
        return <span className="text-gray-400">-</span>;
    }
  };

  // Add a helper component for testing instructions
  const renderTestingHelp = () => {
    return (
      <div className="my-4 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm max-w-3xl mx-auto">
        <h4 className="font-semibold mb-2 text-base">
          Testing with multiple browsers?
        </h4>
        <p className="mb-2">
          We've improved the application to better handle multiple browsers
          accessing the same devices. Here's what to know:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            The application will automatically detect if your camera is already
            in use and switch to audio-only mode for additional browser windows
          </li>
          <li>You'll see clear notifications when this happens</li>
          <li>
            For best results, open the first instance and allow camera and
            microphone access before opening additional instances
          </li>
          <li>
            If you have multiple cameras, you can select different cameras in
            each browser to enable video in both
          </li>
          <li>
            If you get error messages about duplicate keys, it's safe to ignore
            them - this is just React's way of warning about identical device
            IDs
          </li>
        </ul>
        <p className="mt-2 font-medium">
          Problem persists? Try refreshing one browser window while keeping the
          other open.
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white flex flex-col">
      <nav className="bg-white shadow-sm z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="text-2xl font-bold text-blue-800 flex items-center">
            <span className="mr-2">🚀</span> TeamSync
          </div>
        </div>
      </nav>

      {/* Add the testing help at the top for visibility */}
      {renderTestingHelp()}

      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join Conference
            </h1>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="flex justify-center gap-2 p-4 bg-gray-50 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("audioVideo")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === "audioVideo"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow"
                }`}
                type="button"
              >
                <div className="flex items-center">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Audio & Video
                </div>
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === "settings"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow"
                }`}
                type="button"
              >
                <div className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </div>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col">
                  <div className="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center relative mb-4">
                    {videoEnabled ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      ></video>
                    ) : (
                      <div className="text-white flex flex-col items-center justify-center h-full">
                        <VideoOff size={48} />
                        <p className="mt-2">Video is off</p>
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded-lg">
                      {userName || "User"}
                    </div>
                  </div>

                  <div className="flex justify-center space-x-2 mb-6">
                    <button
                      onClick={toggleVideo}
                      className={`p-3 rounded-full ${
                        videoEnabled
                          ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      type="button"
                    >
                      {videoEnabled ? (
                        <Video size={24} />
                      ) : (
                        <VideoOff size={24} />
                      )}
                    </button>
                    <button
                      onClick={toggleAudio}
                      className={`p-3 rounded-full ${
                        audioEnabled
                          ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      type="button"
                    >
                      {audioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
                    </button>
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="user-name"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="user-name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="room-id"
                    >
                      Room ID (leave empty to create a new room)
                    </label>
                    <input
                      type="text"
                      id="room-id"
                      value={roomInputValue}
                      onChange={(e) => setRoomInputValue(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter room ID to join"
                    />
                  </div>

                  <div className="mb-4 flex justify-center">
                    <button
                      onClick={handleJoinConference}
                      disabled={!isReady}
                      className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium shadow-lg transition-all 
                        ${
                          isReady
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      type="button"
                    >
                      {roomInputValue ? "Join Meeting" : "Create Meeting"}
                    </button>
                  </div>
                </div>

                <div>
                  {activeTab === "audioVideo" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Audio & Video Settings
                      </h3>

                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-gray-700 font-medium">
                              Camera
                            </label>
                            <div className="flex items-center">
                              <span className="text-sm text-gray-500 mr-2">
                                Status:
                              </span>
                              {getPermissionStatusIcon(
                                devicePermissionStatus.camera
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="relative flex items-center flex-grow">
                              <select
                                className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none disabled:bg-gray-100 disabled:text-gray-400"
                                value={selectedCamera}
                                onChange={(e) => changeCamera(e.target.value)}
                                disabled={
                                  !videoEnabled || cameraDevices.length === 0
                                }
                              >
                                {cameraDevices.map((device, index) => (
                                  <option
                                    key={`camera-${device.deviceId}-${index}`}
                                    value={device.deviceId}
                                  >
                                    {device.label ||
                                      `Camera ${
                                        cameraDevices.indexOf(device) + 1
                                      }`}
                                  </option>
                                ))}
                                {cameraDevices.length === 0 && (
                                  <option value="">No cameras available</option>
                                )}
                              </select>
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg
                                  className="h-4 w-4 text-gray-500"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-gray-700 font-medium">
                              Microphone
                            </label>
                            <div className="flex items-center">
                              <span className="text-sm text-gray-500 mr-2">
                                Status:
                              </span>
                              {getPermissionStatusIcon(
                                devicePermissionStatus.microphone
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="relative flex items-center flex-grow">
                              <select
                                className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none disabled:bg-gray-100 disabled:text-gray-400"
                                value={selectedMicrophone}
                                onChange={(e) =>
                                  changeMicrophone(e.target.value)
                                }
                                disabled={
                                  !audioEnabled ||
                                  microphoneDevices.length === 0
                                }
                              >
                                {microphoneDevices.map((device, index) => (
                                  <option
                                    key={`mic-${device.deviceId}-${index}`}
                                    value={device.deviceId}
                                  >
                                    {device.label ||
                                      `Microphone ${
                                        microphoneDevices.indexOf(device) + 1
                                      }`}
                                  </option>
                                ))}
                                {microphoneDevices.length === 0 && (
                                  <option value="">
                                    No microphones available
                                  </option>
                                )}
                              </select>
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg
                                  className="h-4 w-4 text-gray-500"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "settings" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Settings
                      </h3>

                      <div className="space-y-4">
                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-800 mb-2">
                            Video Quality
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="hd"
                                name="quality"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                defaultChecked
                              />
                              <label
                                htmlFor="hd"
                                className="ml-2 block text-sm text-gray-700"
                              >
                                High quality
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="sd"
                                name="quality"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <label
                                htmlFor="sd"
                                className="ml-2 block text-sm text-gray-700"
                              >
                                Standard quality
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreConferenceSetup;
