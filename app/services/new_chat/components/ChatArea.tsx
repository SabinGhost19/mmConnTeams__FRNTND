"use client";
import React, { useState, useRef, useEffect } from "react";
import { FiSend, FiPaperclip, FiSmile } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";

import Message from "./Message";
interface MessageType {
  id: string;
  sender: {
    id: number;
    name: string;
    avatar?: string;
    status: string;
  };
  content: string;
  timestamp: string;
  attachments: any[];
  reactions: any[];
  isRead: boolean;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatarUrl?: string;
  status: string;
}

interface ChatAreaProps {
  messages: MessageType[];
  currentUser: User;
  users: User[];
  onSendMessage: (content: string, attachments: any[]) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onFileUpload: (file: File) => Promise<any>;
  onTyping?: (isTyping: boolean) => void;
  teamName: string;
  channelName: string;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  currentUser,
  users,
  onSendMessage,
  onReaction,
  onFileUpload,
  onTyping,
  teamName,
  channelName,
}) => {
  const [messageText, setMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to the bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle typing indicator
  useEffect(() => {
    if (!onTyping) return;

    // When user is typing, emit typing event
    if (messageText && messageText.length > 0) {
      onTyping(true);

      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set a new timeout to turn off typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    } else {
      // If message is empty, user is not typing
      onTyping(false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageText, onTyping]);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && attachments.length === 0) return;

    onSendMessage(messageText, attachments);
    setMessageText("");
    setAttachments([]);

    // After sending, clear typing indicator
    if (onTyping) {
      onTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setMessageText((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(e.target.files).map((file) =>
        onFileUpload(file)
      );
      const uploadedFiles = await Promise.all(uploadPromises);
      const validFiles = uploadedFiles.filter((file) => file !== null);

      setAttachments((prev) => [...prev, ...validFiles]);
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeAttachment = (id: number) => {
    setAttachments(attachments.filter((attachment) => attachment.id !== id));
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { [key: string]: MessageType[] } = {};

    messages.forEach((message) => {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const getTypingIndicatorText = () => {
    if (typingUsers.size === 0) return null;

    const typingUsernames = Array.from(typingUsers).map((userId) => {
      const user = users.find((u) => u.id === userId);
      return user ? `${user.firstName} ${user.lastName}` : "Someone";
    });

    if (typingUsernames.length === 1) {
      return `${typingUsernames[0]} is typing...`;
    } else if (typingUsernames.length === 2) {
      return `${typingUsernames[0]} and ${typingUsernames[1]} are typing...`;
    } else {
      return "Several people are typing...";
    }
  };

  const messageGroups = groupMessagesByDate();
  const typingIndicatorText = getTypingIndicatorText();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Channel title */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="text-sm text-gray-500">
          {teamName} / {channelName}
        </div>
      </div>

      {/* Messages area with scroll */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.entries(messageGroups).map(([date, msgs]) => (
          <div key={date}>
            <div className="text-center my-4">
              <span className="bg-gray-200 text-gray-600 text-xs rounded-full px-2 py-1">
                {date}
              </span>
            </div>
            {msgs.map((message) => (
              <Message
                key={message.id}
                message={message}
                isOwnMessage={message.sender.id === currentUser?.id}
                onReaction={(emoji: string) => onReaction(message.id, emoji)}
              />
            ))}
          </div>
        ))}

        {/* Typing indicator */}
        {typingIndicatorText && (
          <div className="text-gray-500 text-sm italic mt-2 ml-2">
            {typingIndicatorText}
          </div>
        )}

        <div ref={endOfMessagesRef} />
      </div>

      {/* Attachment preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="bg-gray-100 rounded p-2 flex items-center gap-2"
              >
                <span className="text-sm truncate max-w-[150px]">
                  {file.name}
                </span>
                <button
                  onClick={() => removeAttachment(file.id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="p-4 border-t border-gray-200">
        <div className="relative flex items-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-blue-500"
            disabled={isUploading}
          >
            <FiPaperclip className={isUploading ? "animate-pulse" : ""} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            className="hidden"
          />

          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-500 hover:text-yellow-500"
            >
              <FiSmile />
            </button>
            {showEmojiPicker && (
              <div
                className="absolute bottom-10 left-0 z-10"
                ref={emojiPickerRef}
              >
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>

          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32 min-h-[40px] resize-y"
            rows={1}
          />

          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() && attachments.length === 0}
            className={`p-2 ml-2 rounded-full ${
              !messageText.trim() && attachments.length === 0
                ? "text-gray-400 bg-gray-100"
                : "text-white bg-blue-500 hover:bg-blue-600"
            }`}
          >
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
