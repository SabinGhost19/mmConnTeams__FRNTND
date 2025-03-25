"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  FiMoreHorizontal,
  FiSmile,
  FiShare,
  FiTrash2,
  FiEdit,
  FiCheck,
} from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";

interface MessageProps {
  message: {
    id: string;
    sender: {
      id: number;
      name: string;
      avatar?: string;
      status: string;
    };
    content: string;
    timestamp: string;
    attachments: Array<{
      id: number;
      name: string;
      type: string;
      size: string;
      url: string;
    }>;
    reactions: Array<{
      emoji: string;
      count: number;
      users: number[];
    }>;
    isRead: boolean;
  };
  isOwnMessage: boolean;
  onReaction: (emoji: string) => void;
  onEdit?: (newContent: string) => void;
  onDelete?: () => void;
}

const Message: React.FC<MessageProps> = ({
  message,
  isOwnMessage,
  onReaction,
  onEdit,
  onDelete,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Close emoji picker and options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus edit input when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      // Place cursor at the end
      const length = editInputRef.current.value.length;
      editInputRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const handleEmojiClick = (emojiData: any) => {
    onReaction(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleEditSubmit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(editContent.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditContent(message.content);
    }
  };

  // Function to get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) return "📷";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("excel") || fileType.includes("spreadsheet"))
      return "📊";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("zip") || fileType.includes("compressed"))
      return "📦";
    return "📎";
  };

  // Function to determine if file is an image that can be previewed
  const isPreviewableImage = (fileType: string) => {
    return (
      fileType.includes("image") &&
      (fileType.includes("jpeg") ||
        fileType.includes("jpg") ||
        fileType.includes("png") ||
        fileType.includes("gif") ||
        fileType.includes("webp"))
    );
  };

  return (
    <div
      className={`flex mb-4 ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      {!isOwnMessage && (
        <div className="mr-2 flex-shrink-0">
          {message.sender.avatar ? (
            <img
              src={message.sender.avatar}
              alt={message.sender.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
              {message.sender.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      <div
        className={`max-w-3/4 ${
          isOwnMessage
            ? "bg-blue-500 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg"
            : "bg-gray-100 text-gray-800 rounded-tr-lg rounded-tl-lg rounded-br-lg"
        }`}
      >
        <div className="p-3 relative">
          {!isOwnMessage && (
            <div className="text-sm font-semibold mb-1">
              {message.sender.name}
            </div>
          )}

          {isEditing ? (
            <div className="mb-2">
              <textarea
                ref={editInputRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={Math.max(2, editContent.split("\n").length)}
              />
              <div className="flex justify-end mt-1">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(message.content);
                  }}
                  className="text-xs mr-2 px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="text-xs px-2 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="break-words whitespace-pre-wrap">
              {message.content}
            </div>
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="rounded border border-gray-200 bg-white p-2"
                >
                  {isPreviewableImage(attachment.type) ? (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="max-h-60 rounded"
                      />
                    </a>
                  ) : (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-blue-500 hover:underline"
                    >
                      <span className="mr-2">
                        {getFileIcon(attachment.type)}
                      </span>
                      <span className="flex-1 truncate">{attachment.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {attachment.size}
                      </span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Message timestamp */}
          <div
            className={`text-xs mt-1 ${
              isOwnMessage ? "text-blue-200" : "text-gray-500"
            }`}
          >
            {formatTime(message.timestamp)}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction, index) => (
                <button
                  key={`${reaction.emoji}-${index}`}
                  onClick={() => onReaction(reaction.emoji)}
                  className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 
                    ${
                      reaction.users.includes(message.sender.id)
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    } hover:bg-blue-50`}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Message options */}
          <div className="absolute top-2 right-2">
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className={`p-1 rounded-full ${
                  isOwnMessage
                    ? "text-blue-200 hover:text-white"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <FiMoreHorizontal size={16} />
              </button>

              {showOptions && (
                <div
                  ref={optionsRef}
                  className="absolute right-0 mt-1 bg-white shadow-lg rounded-md py-1 w-40 z-10"
                >
                  <button
                    onClick={() => {
                      setShowEmojiPicker(true);
                      setShowOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    <FiSmile size={16} />
                    <span>Add Reaction</span>
                  </button>

                  {isOwnMessage && onEdit && (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowOptions(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FiEdit size={16} />
                      <span>Edit</span>
                    </button>
                  )}

                  {isOwnMessage && onDelete && (
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this message?"
                          )
                        ) {
                          onDelete();
                        }
                        setShowOptions(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-500 flex items-center gap-2"
                    >
                      <FiTrash2 size={16} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}

              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  className="absolute right-0 mt-1 z-20"
                >
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
