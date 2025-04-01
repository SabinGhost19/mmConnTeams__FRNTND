"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import WebSocketClient from "./WebSocketClient";
import { MessageDTO, ReactionDTO, User } from "./interface";
import { getAccessToken } from "@/app/lib/auth-utils";
import LoadingSpinner from "./LoadingSpinner";
import LoadingBox from "./LoadingBox";
import Message from "./Message";

const EMOJI_MAP: Record<string, string> = {
  like: "👍",
  love: "❤️",
  laugh: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
  clap: "👏",
  fire: "🔥",
};

// Get emoji icon element for display
const getEmojiIcon = (type: string, size: "sm" | "md" | "lg" = "md") => {
  const emoji = EMOJI_MAP[type] || "👍";
  const sizeClass =
    size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <span className={`inline-block ${sizeClass} leading-none`}>{emoji}</span>
  );
};

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

interface ReactionProps {
  reaction: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

const Reaction = ({ reaction, count, isActive, onClick }: ReactionProps) => (
  <button
    className={`px-2 py-1 rounded-full text-xs mr-1 ${
      isActive
        ? "bg-[#bbdefb] text-[#0d47a1]"
        : "bg-[#f5f5f5] hover:bg-gray-200"
    }`}
    onClick={onClick}
  >
    {getEmojiIcon(reaction, "sm")} {count > 1 && count}
  </button>
);

interface TypingIndicatorProps {
  typingUsers: string[];
}

const TypingIndicator = ({ typingUsers }: TypingIndicatorProps) => {
  if (typingUsers.length === 0) return null;

  let text = "";
  if (typingUsers.length === 1) {
    text = `${typingUsers[0]} is typing...`;
  } else if (typingUsers.length === 2) {
    text = `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
  } else {
    text = `${typingUsers.length} people are typing...`;
  }

  return <div className="text-xs italic text-gray-500 px-3 py-1">{text}</div>;
};

interface ChannelMessagesProps {
  channelId: string;
  currentUserId: string;
  teamId: string;
}

const ChannelMessages = ({
  channelId,
  currentUserId,
  teamId,
}: ChannelMessagesProps) => {
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelIdRef = useRef<string>(channelId);
  const [isLoading, setIsLoading] = useState(true);
  const previousChannelIdRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<{ file: File; progress: number }[]>(
    []
  );
  const [filePreview, setFilePreview] = useState<{
    name: string;
    url: string;
  } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);

  // Update channel reference when it changes
  useEffect(() => {
    channelIdRef.current = channelId;
  }, [channelId]);

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsUsersLoading(true);
        const token = getAccessToken();
        if (!token) {
          console.error("No authentication token found");
          return;
        }

        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
          }/api/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }

        const data = await response.json();
        console.log("Retrieved users data:", data);
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (
      previousChannelIdRef.current &&
      previousChannelIdRef.current !== channelId
    ) {
      console.log(
        `Channel changed from ${previousChannelIdRef.current} to ${channelId}`
      );
      setMessages([]);
      setTypingUsers([]);
      setIsLoading(true);
    }
    previousChannelIdRef.current = channelId;
  }, [channelId]);

  // Handle messages received from WebSocket - stable reference
  const handleMessagesReceived = useCallback((newMessages: MessageDTO[]) => {
    console.log(`Received ${newMessages.length} messages from server`);
    setMessages(newMessages);
    setIsLoading(false);

    // Auto-scroll după încărcarea mesajelor
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  // Handle typing indicators from other users - stable reference
  const handleTyping = useCallback(
    (data: { userName: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        if (data.isTyping) {
          if (!prev.includes(data.userName)) {
            return [...prev, data.userName];
          }
        } else {
          return prev.filter((name) => name !== data.userName);
        }
        return prev;
      });
    },
    []
  );

  // Handle users leaving the channel - stable reference
  const handleUserLeft = useCallback((data: { userName: string }) => {
    setTypingUsers((prev) => prev.filter((name) => name !== data.userName));
  }, []);

  // WebSocket client integration
  const {
    status,
    error,
    sendMessage: wsSendMessage,
    sendTyping: wsSendTyping,
    addReaction,
    removeReaction,
    refreshMessages,
    uploadFile,
  } = WebSocketClient({
    channelId,
    onMessagesReceived: handleMessagesReceived,
    onUserJoined: () => {}, // Empty function to avoid null checks
    onUserLeft: handleUserLeft,
    onTyping: handleTyping,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (!input.trim() && !filePreview) return;

    // Add the message to the local state immediately
    const newMessage: MessageDTO = {
      id: Date.now().toString(), // Temporary ID
      content: input.trim(),
      senderId: currentUserId,
      senderName: "You",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      channelId: channelId,
      reactions: [],
      attachments: [],
      isRead: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsTyping(false);

    // Send message with attachments
    wsSendMessage(input.trim() || "Shared a file", []);

    // Clear file preview after sending
    setFilePreview(null);
  };

  // Clean up typing timeout on unmount or channel change
  useEffect(() => {
    return () => {
      console.log(
        "Cleaning up ChannelMessages for channel",
        channelIdRef.current
      );
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      // Clear typing indicator on unmount
      if (isTyping) {
        setIsTyping(false);
      }
    };
  }, [isTyping]);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0]; // For simplicity, handle one file at a time

      // Add file to uploads with 0% progress
      setUploads((prev) => [...prev, { file, progress: 0 }]);

      try {
        // Create a preview if it's an image
        if (file.type.startsWith("image/")) {
          const url = URL.createObjectURL(file);
          setFilePreview({ name: file.name, url });
        }

        // Update progress to show upload started
        setUploads((prev) =>
          prev.map((u) => (u.file === file ? { ...u, progress: 10 } : u))
        );

        // Show loading indicator during file upload
        setIsLoading(true);

        // Upload the file
        const fileData = await uploadFile(file, teamId);

        // Hide loading indicator after upload completes
        setIsLoading(false);

        if (fileData) {
          // Update progress to 100%
          setUploads((prev) =>
            prev.map((u) => (u.file === file ? { ...u, progress: 100 } : u))
          );

          // Send a message with the file attachment info
          wsSendMessage(`Shared a file: ${file.name}`, [
            {
              id: fileData.id,
              name: fileData.fileName,
              url: fileData.url,
              type: file.type,
              size: file.size,
            },
          ]);

          // Clear file preview after sending
          setTimeout(() => {
            setFilePreview(null);
            // Remove from uploads list after a delay
            setUploads((prev) => prev.filter((u) => u.file !== file));
          }, 2000);
        }
      } catch (err) {
        console.error("Error uploading file:", err);

        // Hide loading indicator if error occurs
        setIsLoading(false);

        // Show error in uploads
        setUploads((prev) =>
          prev.map((u) => (u.file === file ? { ...u, progress: -1 } : u))
        );

        // Remove failed upload after delay
        setTimeout(() => {
          setUploads((prev) => prev.filter((u) => u.file !== file));
        }, 3000);
      }
    },
    [wsSendMessage, uploadFile, teamId]
  );

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRefreshMessages = useCallback(() => {
    setIsLoading(true);
    refreshMessages();
  }, [refreshMessages]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Connection status indicator */}
      {status !== "connected" && (
        <div
          className={`p-2 text-center text-sm ${
            status === "connecting"
              ? "bg-yellow-100"
              : status === "error"
              ? "bg-red-100"
              : "bg-gray-100"
          }`}
        >
          {status === "connecting"
            ? "Connecting to chat server..."
            : status === "error"
            ? `Error: ${error || "Failed to connect"}`
            : "Disconnected from chat server"}
        </div>
      )}

      {/* Messages container */}
      <div
        className="flex-1 overflow-y-auto px-4 py-2"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #e0f7fa 100%)",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Refresh button */}
        <div className="flex justify-center mb-2">
          <button
            onClick={handleRefreshMessages}
            className="px-3 py-1 text-xs text-[#0d47a1] hover:text-[#1565c0] bg-white hover:bg-gray-100 rounded-full shadow-sm transition-colors"
          >
            ↻ Refresh Messages
          </button>
        </div>

        {isLoading || isUsersLoading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingBox
              size={40}
              message={
                isUsersLoading ? "Loading user data..." : "Loading messages..."
              }
              sx={{ backgroundColor: "transparent", boxShadow: "none" }}
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg font-medium mb-2">No messages yet</p>
            <p className="text-sm">
              Start the conversation by sending a message!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              users={users}
              onReactionAdd={addReaction}
              onReactionRemove={removeReaction}
            />
          ))
        )}

        {/* Typing indicator */}
        <TypingIndicator typingUsers={typingUsers} />

        <div ref={messagesEndRef} />
      </div>

      {/* File preview */}
      {filePreview && (
        <div className="p-2 border-t border-gray-200">
          <div className="flex items-center p-2 bg-gray-50 rounded">
            <div className="flex-shrink-0 mr-2">
              <img
                src={filePreview.url}
                alt={filePreview.name}
                className="h-16 w-16 object-cover rounded"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {filePreview.name}
              </p>
              <p className="text-xs text-gray-500">Ready to send</p>
            </div>
            <button
              onClick={() => setFilePreview(null)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Upload progress indicators */}
      {uploads.length > 0 && (
        <div className="p-2 border-t border-gray-200">
          {uploads.map((upload, index) => (
            <div key={index} className="flex items-center mb-2">
              <div className="w-6 h-6 mr-2 flex-shrink-0">
                {upload.progress < 0 ? (
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : upload.progress === 100 ? (
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-blue-500 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm">{upload.file.name}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      upload.progress < 0 ? "bg-red-500" : "bg-blue-500"
                    }`}
                    style={{
                      width: `${upload.progress < 0 ? 100 : upload.progress}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat input area */}
      <div className="border-t border-gray-200 p-3 bg-[#f0f2f5]">
        <div className="flex items-end space-x-2 max-w-4xl mx-auto">
          {/* Emoji button */}
          <button className="p-2 text-gray-500 hover:text-[#0d47a1] rounded-full transition-colors hover:bg-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {/* File attachment button */}
          <button
            onClick={handleFileButtonClick}
            className="p-2 text-gray-500 hover:text-[#0d47a1] rounded-full transition-colors hover:bg-gray-200"
            title="Attach file"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setIsTyping(true);
                if (typingTimeoutRef.current) {
                  clearTimeout(typingTimeoutRef.current);
                }
                typingTimeoutRef.current = setTimeout(() => {
                  setIsTyping(false);
                }, 1000);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full py-2.5 px-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#0d47a1] focus:border-[#0d47a1] resize-none shadow-sm"
              rows={1}
            />
          </div>

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() && !filePreview}
            className="p-3 rounded-full bg-[#0d47a1] text-white disabled:opacity-50 transition-all hover:bg-[#1565c0] shadow-sm disabled:shadow-none transform hover:scale-105 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelMessages;
