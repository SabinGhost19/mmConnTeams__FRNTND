"use client";
import React, { useState, useRef, useEffect } from "react";
import MessageComponent from "./MessageComponent";
import ChatInput from "./ChatInput";
import { UserTeam } from "@/app/types/models_types/userType";

// interface User {
//   id: string;
//   name: string;
//   avatar?: string;
//   status: string;
// }

interface Message {
  id: string;
  sender: UserTeam;
  content: string;
  timestamp: string;
  attachments: any[];
  reactions: any[];
  isRead: boolean;
}

interface ChatAreaProps {
  messages: Message[];
  currentUser: UserTeam;
  users: UserTeam[];
  onSendMessage: (content: string, attachments: any[]) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onFileUpload?: (file: File) => void;
  teamName: string;
  channelName: string;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages = [],
  currentUser = { id: "", name: "" },
  users = [],
  onSendMessage,
  onReaction,
  onFileUpload,
  teamName,
  channelName,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages?.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages?.length]);

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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(
      attachments.filter((attachment) => attachment.id !== attachmentId)
    );
  };

  const handleSendMessage = (content: string) => {
    onSendMessage(content, attachments);
    setAttachments([]);
  };

  // Empty state
  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
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
            <p className="text-gray-500 mt-2">
              Începe o conversație cu echipa în canalul #{channelName}
            </p>
          </div>
        </div>

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
  }

  // Group messages by date with safety checks
  const groupedMessages = messages.reduce((groups, message) => {
    if (!message?.timestamp) return groups;

    try {
      const date = new Date(message.timestamp).toLocaleDateString("ro-RO");
      if (!groups[date]) {
        groups[date] = [];
      }
      if (message) {
        groups[date].push(message);
      }
      return groups;
    } catch (e) {
      console.error("Invalid message timestamp:", message.timestamp);
      return groups;
    }
  }, {} as Record<string, Message[]>);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-gray-50">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
      >
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="border-t border-gray-200 flex-grow"></div>
              <div className="mx-4 text-xs text-gray-500 font-medium">
                {new Date(date).toLocaleDateString("ro-RO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="border-t border-gray-200 flex-grow"></div>
            </div>

            {msgs.map((message, index) => {
              // Skip invalid messages
              if (!message || !message.sender || !message.sender.id) {
                console.warn("Invalid message:", message);
                return null;
              }

              const prevMessage = msgs[index - 1];
              const showAvatar =
                index === 0 ||
                !prevMessage?.sender ||
                prevMessage.sender.id !== message.sender.id;

              return (
                <MessageComponent
                  key={message.id}
                  message={message}
                  currentUser={currentUser}
                  isCurrentUserMessage={message.sender.id === currentUser?.id}
                  showAvatar={showAvatar}
                  onReaction={onReaction}
                />
              );
            })}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

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
