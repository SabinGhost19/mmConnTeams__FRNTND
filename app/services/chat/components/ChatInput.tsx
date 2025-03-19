// components/TeamsChat/ChatInput.tsx
"use client";
import React, { useState, useRef } from "react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  attachments: any[];
  onFileUpload: (files: FileList | null) => void;
  onRemoveAttachment: (attachmentId: string) => void;
  teamName: string;
  channelName: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  attachments,
  onFileUpload,
  onRemoveAttachment,
  teamName,
  channelName,
}) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Common emojis
  const commonEmojis = [
    "😊",
    "👍",
    "❤️",
    "🎉",
    "🔥",
    "👏",
    "💯",
    "🙏",
    "👀",
    "💪",
    "😂",
    "😍",
    "🤔",
    "😭",
    "😎",
    "🧐",
    "😴",
    "😇",
    "🤓",
    "🤯",
  ];

  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim() || attachments.length > 0) {
      onSendMessage(message);
      setMessage("");
    }
  };

  // Handle file selection
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileUpload(e.target.files);
    // Reset the file input so the same file can be uploaded again if needed
    e.target.value = "";
  };

  // Handle inserting emoji into message
  const handleEmojiClick = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Handle key press for shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without Shift for new line)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Get icon for attachment type
  const getAttachmentTypeIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-blue-500"
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
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-red-500"
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
    } else {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-500"
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
    <div className="bg-white border-t border-gray-200">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border-b border-gray-200">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center bg-gray-100 rounded-lg px-3 py-1.5 text-sm"
            >
              {getAttachmentTypeIcon(attachment.type)}
              <span className="ml-2 mr-1 max-w-[150px] truncate">
                {attachment.name}
              </span>
              <button
                onClick={() => onRemoveAttachment(attachment.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3">
        <div className="relative flex items-center">
          {/* Channel Placeholder Text */}
          <div className="absolute top-0 left-3 mt-2.5 text-xs text-gray-500 pointer-events-none">
            Către: <span className="font-medium">#{channelName}</span> în{" "}
            <span className="font-medium">{teamName}</span>
          </div>

          {/* Text Area */}
          <div className="relative flex-1 mt-5">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scrie un mesaj..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[40px] max-h-[120px]"
              rows={1}
              style={{ overflowY: "auto" }}
            />

            {/* Emoji Picker */}
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-3 bottom-2 text-gray-500 hover:text-gray-700 focus:outline-none"
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

              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-10">
                  <div className="grid grid-cols-10 gap-1">
                    {commonEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleEmojiClick(emoji)}
                        className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attachment Button */}
          <div className="ml-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              multiple
            />
            <button
              type="button"
              onClick={handleFileSelect}
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
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
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>
          </div>

          {/* Send Button */}
          <div className="ml-2">
            <button
              type="submit"
              disabled={!message.trim() && attachments.length === 0}
              className={`p-2 rounded-full focus:outline-none ${
                message.trim() || attachments.length > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Format Tools */}
        <div className="flex items-center mt-1 text-gray-500 text-xs">
          <button
            type="button"
            className="mr-3 p-1 hover:bg-gray-100 rounded"
            title="Text îngroșat (Ctrl+B)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </button>
          <button
            type="button"
            className="mr-3 p-1 hover:bg-gray-100 rounded"
            title="Text italic (Ctrl+I)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M14.707 10.5a1 1 0 01-.707.293h-2.586l-1 1v2a1 1 0 01-1 1h-1a1 1 0 01-1-1v-2l-1-1H4.707a1 1 0 110-2h2.586l1-1V6a1 1 0 011-1h1a1 1 0 011 1v2l1 1h2.586a1 1 0 01.707 1.707z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            type="button"
            className="mr-3 p-1 hover:bg-gray-100 rounded"
            title="Text subliniat (Ctrl+U)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M6 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zM3 7a1 1 0 011-1h10a1 1 0 110 2H4a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
          </button>
          <button
            type="button"
            className="mr-3 p-1 hover:bg-gray-100 rounded"
            title="Listă cu buline"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </button>
          <button
            type="button"
            className="mr-3 p-1 hover:bg-gray-100 rounded"
            title="Cod sau text preformatat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </button>

          <span className="ml-auto text-gray-400 text-xs">
            Apasă Enter pentru a trimite, Shift+Enter pentru linie nouă
          </span>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
