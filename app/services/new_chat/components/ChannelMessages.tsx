"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import WebSocketClient from "./WebSocketClient";
import { MessageDTO, ReactionDTO } from "./interface";
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

interface MessageProps {
  message: MessageDTO;
  currentUserId: string;
  onReactionAdd: (messageId: string, reactionType: string) => void;
  onReactionRemove: (
    messageId: string,
    reactionType: string,
    reactionId: string
  ) => void;
}

const Message = ({
  message,
  currentUserId,
  onReactionAdd,
  onReactionRemove,
}: MessageProps) => {
  const isOwnMessage = message.senderId === currentUserId;
  const [showEmojiButton, setShowEmojiButton] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Group reactions by type and count them
  const reactionGroups: Record<string, { count: number; userIds: string[] }> =
    {};
  (message.reactions || []).forEach((reaction) => {
    if (!reactionGroups[reaction.reactionType]) {
      reactionGroups[reaction.reactionType] = {
        count: 0,
        userIds: [],
      };
    }
    reactionGroups[reaction.reactionType].count++;
    reactionGroups[reaction.reactionType].userIds.push(reaction.userId);
  });

  // Check if current user has reacted
  const getUserReaction = (reactionType: string): ReactionDTO | undefined => {
    return (message.reactions || []).find(
      (r) => r.userId === currentUserId && r.reactionType === reactionType
    );
  };

  const handleReaction = (reactionType: string) => {
    const existingReaction = getUserReaction(reactionType);

    if (existingReaction) {
      onReactionRemove(message.id, existingReaction.id, reactionType);
    } else {
      onReactionAdd(message.id, reactionType);
    }
    setShowEmojiPicker(false);
  };

  // Generate initial for avatar
  const getInitial = (name: string): string => {
    return (name || "User").charAt(0).toUpperCase();
  };

  return (
    <div
      className={`flex mb-6 group relative ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
      onMouseEnter={() => setShowEmojiButton(true)}
      onMouseLeave={() => {
        if (!showEmojiPicker) {
          setShowEmojiButton(false);
        }
      }}
    >
      {!isOwnMessage && (
        <div className="h-8 w-8 rounded-full bg-[#0d47a1] text-white flex items-center justify-center mr-2 mt-2 text-sm font-medium flex-shrink-0">
          {getInitial(message.senderName || "U")}
        </div>
      )}
      <div
        className={`max-w-xs sm:max-w-md md:max-w-lg rounded-lg p-3 ${
          isOwnMessage
            ? "bg-[#dcf8c6] text-[#111b21] rounded-tr-none"
            : "bg-white text-[#111b21] rounded-tl-none"
        } shadow-sm relative`}
        style={
          isOwnMessage
            ? { boxShadow: "0 1px 0.5px rgba(0, 0, 0, 0.13)" }
            : { boxShadow: "0 1px 0.5px rgba(0, 0, 0, 0.13)" }
        }
      >
        <div className="flex justify-between items-start mb-1">
          <span
            className={`font-semibold text-sm ${
              isOwnMessage ? "text-[#0d47a1]" : "text-[#0d47a1]"
            }`}
          >
            {isOwnMessage
              ? "You"
              : message.senderName || `User ${message.senderId?.slice(0, 8)}`}
          </span>
          <span className="text-xs text-gray-500 ml-2">
            {formatTime(message.createdAt)}
          </span>
        </div>

        <div className="mb-1 break-words">{message.content}</div>

        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center p-2 bg-white rounded border border-gray-200"
              >
                <div className="mr-2">📎</div>
                <div className="flex-1 truncate">
                  <div className="text-sm font-medium">{file.fileName}</div>
                  <div className="text-xs text-gray-500">
                    {(file.fileSize / 1024).toFixed(1)} KB
                  </div>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0d47a1] hover:text-[#1565c0] text-sm"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Message delivery status for own messages */}
        {isOwnMessage && (
          <div className="absolute bottom-1 right-2 flex items-center">
            <svg
              className="w-3 h-3 text-gray-400"
              viewBox="0 0 16 15"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512z" />
              <path d="M8.666 9.879a.32.32 0 0 0 .484-.033l5.356-6.873a.366.366 0 0 0-.064-.512l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879z" />
            </svg>
          </div>
        )}

        {/* WhatsApp-style emoji reaction button */}
        {showEmojiButton && !showEmojiPicker && (
          <div
            className="absolute -top-8 right-0 bg-white rounded-full shadow-md p-1 cursor-pointer z-10 animate-fade-in"
            onClick={() => setShowEmojiPicker(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500 hover:text-[#0d47a1]"
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
          </div>
        )}

        {/* Emoji picker */}
        {showEmojiPicker && (
          <div className="absolute -top-16 right-0 bg-white rounded-xl shadow-lg p-2 z-20 animate-fade-in">
            <div className="flex space-x-1 flex-wrap max-w-xs justify-center">
              {Object.entries(EMOJI_MAP).map(([type, emoji]) => (
                <button
                  key={type}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full text-xl"
                  onClick={() => handleReaction(type)}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="absolute bottom-0 right-4 w-3 h-3 bg-white transform rotate-45 translate-y-1.5"></div>
          </div>
        )}

        {/* Reactions display - WhatsApp style */}
        {Object.keys(reactionGroups).length > 0 && (
          <div className="absolute -bottom-6 right-4 bg-white rounded-full py-1 px-2 shadow-md inline-flex items-center border border-gray-100">
            {Object.entries(reactionGroups).map(([type, data]) => (
              <span
                key={type}
                className={`text-lg mx-0.5 ${
                  data.userIds.includes(currentUserId)
                    ? "text-[#0d47a1]"
                    : "text-gray-600"
                } cursor-pointer hover:scale-110 transition-transform`}
                onClick={() => handleReaction(type)}
              >
                {EMOJI_MAP[type]}
                {data.count > 1 && (
                  <span className="text-xs ml-0.5 align-top">{data.count}</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
      {isOwnMessage && (
        <div className="h-8 w-8 rounded-full bg-[#0d47a1] text-white flex items-center justify-center ml-2 mt-2 text-sm font-medium flex-shrink-0">
          {getInitial(message.senderName || "You")}
        </div>
      )}
    </div>
  );
};

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
}

const ChannelMessages = ({
  channelId,
  currentUserId,
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

  // Update channel reference when it changes
  useEffect(() => {
    channelIdRef.current = channelId;
  }, [channelId]);

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
    if (!input.trim()) return;

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

    // Here you would typically send the message to your backend
    // For now, we'll just simulate it
    setTimeout(() => {
      // Simulate message being sent
      console.log("Message sent:", newMessage);
    }, 100);
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
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      // In a real app, you would upload the file to your backend first,
      // then send a message with the file attachment info
      console.log("Files selected:", files);

      // Mock implementation: Just send a message mentioning the file
      wsSendMessage(`Attached file: ${files[0].name}`);
    },
    [wsSendMessage]
  );

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
            ? "Connecting..."
            : status === "error"
            ? `Error: ${error}`
            : "Disconnected"}
        </div>
      )}

      {/* Messages container */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
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

        {messages.length === 0 ? (
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
              onReactionAdd={(messageId, reactionType) => {
                // Handle reaction add
                console.log("Add reaction:", messageId, reactionType);
              }}
              onReactionRemove={(messageId, reactionType, reactionId) => {
                // Handle reaction remove
                console.log(
                  "Remove reaction:",
                  messageId,
                  reactionType,
                  reactionId
                );
              }}
            />
          ))
        )}

        {/* Typing indicator */}
        <TypingIndicator typingUsers={typingUsers} />

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
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
          <div className="relative">
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
              multiple
            />
            <label
              htmlFor="file-upload"
              className="p-2 text-gray-500 hover:text-[#0d47a1] rounded-full transition-colors cursor-pointer inline-block hover:bg-gray-200"
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
            </label>
          </div>

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
            onClick={handleSendMessage}
            disabled={!input.trim()}
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
