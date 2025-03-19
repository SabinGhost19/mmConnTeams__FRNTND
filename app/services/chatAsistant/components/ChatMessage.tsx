// components/chat/ChatMessage.tsx
import React from "react";

interface ChatMessageProps {
  message: string;
  sender: "user" | "bot";
  time: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, sender, time }) => {
  return (
    <div
      className={`flex ${sender === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
          sender === "user"
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
        }`}
      >
        <p>{message}</p>
        <p
          className={`text-xs mt-1 ${
            sender === "user" ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
