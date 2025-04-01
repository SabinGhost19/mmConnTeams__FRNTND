"use client";
import React, { useState } from "react";
import { MessageDTO, ReactionDTO, User } from "./interface";

// Define emoji map for reactions
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

// Format time from ISO string
const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

interface MessageProps {
  message: MessageDTO;
  currentUserId: string;
  users: User[];
  onReactionAdd: (messageId: string, reactionType: string) => void;
  onReactionRemove: (
    messageId: string,
    reactionType: string,
    reactionId: string
  ) => void;
}

// Get file icon based on file type
const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) {
    return (
      <svg
        className="w-5 h-5 text-blue-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    );
  } else if (type.includes("pdf")) {
    return (
      <svg
        className="w-5 h-5 text-red-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    );
  } else if (type.includes("audio")) {
    return (
      <svg
        className="w-5 h-5 text-purple-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
        />
      </svg>
    );
  } else if (type.includes("video")) {
    return (
      <svg
        className="w-5 h-5 text-green-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    );
  } else {
    return (
      <svg
        className="w-5 h-5 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    );
  }
};

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / 1048576).toFixed(1) + " MB";
};

const Message: React.FC<MessageProps> = ({
  message,
  currentUserId,
  users,
  onReactionAdd,
  onReactionRemove,
}) => {
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

  // Filter out reactions with count 0
  const activeReactions = Object.entries(reactionGroups).filter(
    ([_, data]) => data.count > 0
  );

  // Check if current user has reacted
  const getUserReaction = (reactionType: string): ReactionDTO | undefined => {
    const userReaction = (message.reactions || []).find(
      (r) => r.userId === currentUserId && r.reactionType === reactionType
    );
    return userReaction;
  };

  const handleReaction = (reactionType: string) => {
    const existingReaction = getUserReaction(reactionType);

    if (existingReaction) {
      // If user already has this reaction, remove it
      onReactionRemove(message.id, reactionType, existingReaction.id);
    } else {
      // If user doesn't have this reaction, add it
      onReactionAdd(message.id, reactionType);
    }
    setShowEmojiPicker(false);
  };

  // Get full name for display
  const getFullName = (userId: string): string => {
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return message.senderName || `User ${userId?.slice(0, 8)}`;
    }
    return `${user.firstName} ${user.lastName}`;
  };

  // Get user tooltip information
  const getUserTooltip = (userId: string): string => {
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return "";
    }

    let tooltip = `${user.firstName} ${user.lastName}`;
    if (user.email) {
      tooltip += ` (${user.email})`;
    }
    if (user.status) {
      tooltip += ` • ${
        user.status.charAt(0).toUpperCase() + user.status.slice(1)
      }`;
    }
    return tooltip;
  };

  // Generate initial for avatar
  const getInitial = (userId: string): string => {
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return (message.senderName || "U").charAt(0).toUpperCase();
    }
    return user.firstName.charAt(0).toUpperCase();
  };

  return (
    <div
      className={`flex mb-16 group relative ${
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
        <div className="h-10 w-10 rounded-full bg-[#0d47a1] text-white flex items-center justify-center mr-3 mt-2 text-sm font-medium flex-shrink-0">
          {getInitial(message.senderId)}
        </div>
      )}
      <div
        className={`max-w-xs sm:max-w-md md:max-w-lg rounded-lg p-4 ${
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
            title={isOwnMessage ? "" : getUserTooltip(message.senderId)}
          >
            {isOwnMessage ? "You" : getFullName(message.senderId)}
          </span>
          <span className="text-xs text-gray-500 ml-2">
            {formatTime(message.createdAt)}
          </span>
        </div>

        <div className="mb-1 break-words">{message.content}</div>

        {/* File attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center">
                {attachment.fileType &&
                attachment.fileType.startsWith("image/") ? (
                  // Image attachment preview
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <img
                      src={attachment.url}
                      alt={attachment.fileName}
                      className="rounded-md max-h-48 max-w-full object-contain bg-gray-100"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {attachment.fileName} •{" "}
                      {formatFileSize(attachment.fileSize)}
                    </div>
                  </a>
                ) : (
                  // Other file type
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-gray-50 rounded-md w-full hover:bg-gray-100 transition-colors"
                  >
                    <div className="mr-3">
                      {getFileIcon(attachment.fileType || "")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {attachment.fileName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(attachment.fileSize || 0)}
                      </div>
                    </div>
                    <div className="ml-2">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </div>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reactions display - WhatsApp style */}
        {activeReactions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {activeReactions.map(([type, data]) => (
              <span
                key={type}
                className={`text-lg ${
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
      </div>
      {isOwnMessage && (
        <div className="h-10 w-10 rounded-full bg-[#0d47a1] text-white flex items-center justify-center ml-3 mt-2 text-sm font-medium flex-shrink-0">
          {getInitial(message.senderId)}
        </div>
      )}
    </div>
  );
};

export default Message;
