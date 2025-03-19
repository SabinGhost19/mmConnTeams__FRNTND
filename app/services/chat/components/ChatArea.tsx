"use client";
import React, { useState, useRef, useEffect } from "react";
import MessageComponent from "./MessageComponent";
import ChatInput from "./ChatInput";
interface Message {
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

interface ChatAreaProps {
  messages: any[];
  currentUser: any;
  users: any[];
  onSendMessage: (content: string, attachments: any[]) => void;
  onReaction: (messageId: string, emoji: string) => void;
  teamName: string;
  channelName: string;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  currentUser,
  users,
  onSendMessage,
  onReaction,
  teamName,
  channelName,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showDateHeader, setShowDateHeader] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Keep track if user is scrolled to bottom
  useEffect(() => {
    const handleScroll = () => {
      if (!chatContainerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const isBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
      setIsAtBottom(isBottom);

      // Show date header on scroll
      if (messages.length > 0) {
        // Find the message that's currently most visible in the viewport
        // This is a simplified version, in a real app you'd do more math to find it accurately
        const scrollRatio = scrollTop / (scrollHeight - clientHeight);
        const messageIndex = Math.floor(scrollRatio * messages.length);
        const message = messages[Math.min(messageIndex, messages.length - 1)];

        if (message) {
          const date = new Date(message.timestamp);
          setShowDateHeader(formatDateForHeader(date));

          // Clear after 2 seconds
          setTimeout(() => {
            setShowDateHeader(null);
          }, 2000);
        }
      }
    };

    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
      return () => chatContainer.removeEventListener("scroll", handleScroll);
    }
  }, [messages]);

  // Format message timestamp for header
  const formatDateForHeader = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Astăzi";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ieri";
    } else {
      return date.toLocaleDateString("ro-RO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  };

  // Handle file attachments
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const newAttachments = Array.from(files).map((file) => ({
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type.split("/")[0],
      size: formatFileSize(file.size),
      file,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));

    setAttachments([...attachments, ...newAttachments]);
  };

  // Format file size to readable format
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Remove attachment
  const removeAttachment = (attachmentId: string) => {
    setAttachments(
      attachments.filter((attachment) => attachment.id !== attachmentId)
    );
  };

  // Scroll chat to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Send message with attachments
  const handleSendMessage = (content: string) => {
    onSendMessage(content, attachments);
    setAttachments([]);
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toLocaleDateString("ro-RO");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-gray-50">
      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
      >
        {/* Date Header (visible on scroll) */}
        {showDateHeader && (
          <div className="sticky top-2 flex justify-center z-10 pointer-events-none">
            <div className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full opacity-80">
              {showDateHeader}
            </div>
          </div>
        )}

        {/* Message Groups by Date */}
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="space-y-4">
            {/* Date Divider */}
            <div className="flex items-center justify-center">
              <div className="border-t border-gray-200 flex-grow"></div>
              <div className="mx-4 text-xs text-gray-500 font-medium">
                {formatDateForHeader(new Date(date))}
              </div>
              <div className="border-t border-gray-200 flex-grow"></div>
            </div>
            {(msgs as Message[]).map((message, index) => (
              <MessageComponent
                key={message.id}
                message={message}
                currentUser={currentUser}
                isCurrentUserMessage={message.sender.id === currentUser.id}
                showAvatar={
                  index === 0 ||
                  (msgs as Message[])[index - 1].sender.id !== message.sender.id
                }
                onReaction={onReaction}
              />
            ))}
          </div>
        ))}

        {/* Empty chat state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Nicio conversație încă
            </h3>
            <p className="text-gray-500 text-center mt-2">
              Începe o conversație cu echipa în canalul #{channelName}
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        attachments={attachments}
        onFileUpload={handleFileUpload}
        onRemoveAttachment={removeAttachment}
        teamName={teamName}
        channelName={channelName}
      />
    </div>
  );
};

export default ChatArea;
