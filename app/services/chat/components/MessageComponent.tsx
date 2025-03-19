// components/TeamsChat/MessageComponent.tsx
"use client";

import React, { useState, useRef } from "react";

interface MessageComponentProps {
  message: any;
  currentUser: any;
  isCurrentUserMessage: boolean;
  showAvatar: boolean;
  onReaction: (messageId: string, emoji: string) => void;
}

const MessageComponent: React.FC<MessageComponentProps> = ({
  message,
  currentUser,
  isCurrentUserMessage,
  showAvatar,
  onReaction,
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get formatted date for detailed timestamp
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("ro-RO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Common emojis for reactions
  const commonEmojis = ["👍", "❤️", "😂", "🎉", "👏", "🔥"];

  // Handle message context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowContextMenu(true);

    // Close menu when clicking outside
    const closeContextMenu = () => {
      setShowContextMenu(false);
      document.removeEventListener("click", closeContextMenu);
    };

    // Add event listener with a small delay to avoid immediate triggering
    setTimeout(() => {
      document.addEventListener("click", closeContextMenu);
    }, 100);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-400";
      case "busy":
        return "bg-red-400";
      case "away":
        return "bg-yellow-400";
      default:
        return "bg-gray-400";
    }
  };

  // Get attachment icon based on file type
  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case "image":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-500"
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
      case "pdf":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-red-500"
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
      case "markdown":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-purple-500"
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
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
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
        );
    }
  };

  return (
    <div
      ref={messageRef}
      className={`flex ${
        isCurrentUserMessage ? "justify-end" : "justify-start"
      } group`}
      onContextMenu={handleContextMenu}
    >
      {/* Avatar (only shown for first message in a series) */}
      {!isCurrentUserMessage && showAvatar && (
        <div className="flex-shrink-0 mr-4 mt-1">
          <div className="relative">
            <img
              src={
                message.sender.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  message.sender.name
                )}&background=0D8ABC&color=fff`
              }
              alt={message.sender.name?.toString() || ""}
              className="w-10 h-10 rounded-full"
            />
            <span
              className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${getStatusColor(
                message.sender.status
              )}`}
            ></span>
          </div>
        </div>
      )}

      {/* Message Content */}
      <div
        className={`max-w-[65%] ${
          isCurrentUserMessage ? "order-first mr-4" : ""
        }`}
      >
        {/* Sender Name and Time */}
        {showAvatar && !isCurrentUserMessage && (
          <div className="flex items-center mb-1">
            <span className="font-medium text-gray-900">
              {message.sender.name}
            </span>
            <span
              className="ml-2 text-xs text-gray-500"
              title={formatDate(message.timestamp)}
            >
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}

        {/* Just time for current user's messages */}
        {isCurrentUserMessage && (
          <div className="flex justify-end mb-1">
            <span
              className="text-xs text-gray-500"
              title={formatDate(message.timestamp)}
            >
              {formatTime(message.timestamp)}
              {message.isRead && <span className="ml-1 text-blue-500">✓</span>}
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`p-3 rounded-lg shadow-sm ${
            isCurrentUserMessage
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-800 border border-gray-200"
          }`}
        >
          {/* Message Text */}
          <p className="whitespace-pre-wrap break-words">{message.content}</p>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map(
                (attachment: {
                  id: React.Key | null | undefined;
                  type: string;
                  url: string | undefined;
                  name: any;
                  size: any;
                }) => (
                  <div
                    key={attachment.id}
                    className={`flex items-center p-2 rounded ${
                      isCurrentUserMessage ? "bg-blue-700" : "bg-gray-100"
                    }`}
                  >
                    {attachment.type === "image" && attachment.url ? (
                      <div className="w-full">
                        <img
                          src={attachment.url}
                          alt={attachment.name?.toString() || ""}
                          className="rounded max-h-40 max-w-full cursor-pointer hover:opacity-90"
                        />
                        <div className="flex items-center justify-between mt-1">
                          <span
                            className={`text-xs ${
                              isCurrentUserMessage
                                ? "text-blue-200"
                                : "text-gray-500"
                            }`}
                          >
                            {attachment.name}
                          </span>
                          <span
                            className={`text-xs ${
                              isCurrentUserMessage
                                ? "text-blue-200"
                                : "text-gray-500"
                            }`}
                          >
                            {attachment.size}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {getAttachmentIcon(attachment.type)}
                        <div className="ml-2 flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {attachment.name}
                          </div>
                          <div
                            className={`text-xs ${
                              isCurrentUserMessage
                                ? "text-blue-200"
                                : "text-gray-500"
                            }`}
                          >
                            {attachment.size}
                          </div>
                        </div>
                        <a
                          href={attachment.url || "#"}
                          download
                          className={`ml-2 p-1 rounded hover:bg-opacity-80 ${
                            isCurrentUserMessage
                              ? "hover:bg-blue-800"
                              : "hover:bg-gray-200"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 ${
                              isCurrentUserMessage
                                ? "text-blue-200"
                                : "text-gray-600"
                            }`}
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
                        </a>
                      </>
                    )}
                  </div>
                )
              )}
            </div>
          )}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {message.reactions.map(
                (
                  reaction: {
                    emoji: any;
                    users: string | any[];
                    count: any;
                  },
                  index: React.Key | null | undefined
                ) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (
                        typeof message.id === "string" &&
                        typeof reaction.emoji === "string"
                      ) {
                        onReaction(message.id, reaction.emoji);
                      }
                    }}
                    className={`flex items-center px-2 py-0.5 rounded-full text-xs ${
                      reaction.users.includes(currentUser.id)
                        ? isCurrentUserMessage
                          ? "bg-blue-700 text-white"
                          : "bg-blue-100 text-blue-800"
                        : isCurrentUserMessage
                        ? "bg-blue-700/50 text-blue-100"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <span className="mr-1">{reaction.emoji}</span>
                    <span>{reaction.count}</span>
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Reaction Button (appears on hover) - DOAR O SINGURĂ IMPLEMENTARE */}
        <div
          className={`flex mt-1 ${
            isCurrentUserMessage ? "justify-end" : "justify-start"
          }`}
        >
          <div className="relative">
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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

            {/* Reaction Picker - Ajustat pentru a evita redimensionarea */}
            {showReactionPicker && (
              <div
                className={`absolute bottom-full mb-2 bg-white rounded-full shadow-lg border border-gray-200 px-2 py-1 z-10 ${
                  isCurrentUserMessage ? "right-0" : "left-0"
                }`}
                style={{ maxWidth: "280px", overflowX: "auto" }}
              >
                <div className="flex space-x-1">
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        if (typeof message.id === "string") {
                          onReaction(message.id, emoji);
                          setShowReactionPicker(false);
                        }
                      }}
                      className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded-full"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="fixed bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20"
          style={{
            top: `${Math.min(
              window.innerHeight - 200,
              messageRef.current?.getBoundingClientRect().top || 0
            )}px`,
            left: `${Math.min(
              window.innerWidth - 200,
              messageRef.current?.getBoundingClientRect().left || 0
            )}px`,
          }}
        >
          <button className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Copiază
          </button>
          <button className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
            Răspunde
          </button>
          {isCurrentUserMessage && (
            <>
              <button className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Editează
              </button>
              <button className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Șterge
              </button>
            </>
          )}
          <button className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
              />
            </svg>
            Raportează
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageComponent;
