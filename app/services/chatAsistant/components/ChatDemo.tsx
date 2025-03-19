"use client";
// components/chat/ChatDemo.tsx
import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";

interface Message {
  text: string;
  sender: "user" | "bot";
  time: string;
}

const ChatDemo: React.FC = () => {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      text: "Bun venit! Cum te putem ajuta astăzi?",
      sender: "bot",
      time: "10:00 AM",
    },
    {
      text: "Aș dori mai multe informații despre serviciile voastre.",
      sender: "user",
      time: "10:01 AM",
    },
    {
      text: "Sigur! Oferim consultanță în dezvoltare web, design UX/UI și soluții de e-commerce. Care dintre acestea te interesează?",
      sender: "bot",
      time: "10:02 AM",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === "") return;

    const newMessage = {
      text: message,
      sender: "user" as const,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessage("");

    // Simulare răspuns după 1 secundă
    setTimeout(() => {
      const botResponse = {
        text: "Mulțumesc pentru mesaj! Un consultant va răspunde în curând.",
        sender: "bot" as const,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChatMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 h-[600px]">
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-600 font-bold">S</span>
          </div>
          <div>
            <h3 className="font-medium">Suport Clienți</h3>
            <p className="text-xs text-blue-100">
              Online • Răspunde în ~2 minute
            </p>
          </div>
        </div>
      </div>

      <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
        <div className="space-y-4">
          {chatMessages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg.text}
              sender={msg.sender}
              time={msg.time}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Scrie un mesaj..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Trimite mesaj"
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Conversațiile sunt criptate și confidențiale
        </p>
      </div>
    </div>
  );
};

export default ChatDemo;
