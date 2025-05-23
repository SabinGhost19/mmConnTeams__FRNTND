// components/TeamsChat/ChannelHeader.tsx
"use client";
import React, { useState } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";

interface UserDisplay {
  id: string;
  name: string;
  avatar?: string;
  status: string;
}

interface Channel {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  unreadCount: number;
}

interface PrivateChat {
  id: string;
  participants: UserDisplay[];
  unreadCount: number;
  lastMessage?: {
    content: string;
    timestamp: string;
  };
}

interface ChatHeaderProps {
  selectedChannel: Channel | null;
  selectedPrivateChat: PrivateChat | null;
  onMobileMenuClick: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedChannel,
  selectedPrivateChat,
  onMobileMenuClick,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // Mock online users data
  const onlineUsersList = [
    {
      id: 1,
      name: "Ana Popescu",
      avatar: "/avatars/user1.jpg",
      status: "ONLINE",
    },
    {
      id: 5,
      name: "Elena Stancu",
      avatar: "/avatars/user5.jpg",
      status: "ONLINE",
    },
  ];

  // Mock other users data
  const otherUsers = [
    {
      id: 2,
      name: "Mihai Ionescu",
      avatar: "/avatars/user2.jpg",
      status: "OFFLINE",
    },
    {
      id: 3,
      name: "Cristina Dumitrescu",
      avatar: "/avatars/user3.jpg",
      status: "BUSY",
    },
    {
      id: 4,
      name: "Alexandru Popa",
      avatar: "/avatars/user4.jpg",
      status: "AWAY",
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onMobileMenuClick}
            className="md:hidden mr-4 text-gray-500 hover:text-gray-700"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {selectedChannel && (
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">#</span>
              <h2 className="text-xl font-semibold">{selectedChannel.name}</h2>
              {selectedChannel.description && (
                <p className="ml-4 text-gray-500">
                  {selectedChannel.description}
                </p>
              )}
            </div>
          )}

          {selectedPrivateChat && (
            <div className="flex items-center">
              <img
                src={
                  selectedPrivateChat.participants[0].avatar ||
                  "/default-avatar.png"
                }
                alt={selectedPrivateChat.participants[0].name}
                className="w-8 h-8 rounded-full mr-3"
              />
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedPrivateChat.participants[0].name}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedPrivateChat.participants[0].status}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {selectedChannel && (
            <div className="text-sm text-gray-500">
              <span className="font-medium">Online:</span> 3
            </div>
          )}

          {/* Search */}
          <button className="text-gray-600 hover:text-gray-900 focus:outline-none">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* Video Call */}
          <button className="text-gray-600 hover:text-gray-900 focus:outline-none">
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
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>

          {/* Members */}
          <div className="relative">
            <button
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={() => setShowMenu(!showMenu)}
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </button>

            {/* Members Dropdown */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 py-1">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                  <p className="font-semibold">Membri</p>
                  <p className="text-xs text-gray-500">
                    {onlineUsersList.length + otherUsers.length} membri,{" "}
                    {onlineUsersList.length} online
                  </p>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {/* Online Members */}
                  <div className="px-4 py-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Online
                    </p>
                    <ul className="mt-2 space-y-2">
                      {onlineUsersList.map((user) => (
                        <li key={user.id} className="flex items-center">
                          <div className="relative">
                            <img
                              src={
                                user.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  user.name
                                )}&background=0D8ABC&color=fff`
                              }
                              alt={user.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-1 ring-white bg-green-400"></span>
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            {user.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Other Members */}
                  <div className="px-4 py-2 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alți membri
                    </p>
                    <ul className="mt-2 space-y-2">
                      {otherUsers.map((user) => (
                        <li key={user.id} className="flex items-center">
                          <div className="relative">
                            <img
                              src={
                                user.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  user.name
                                )}&background=9CA3AF&color=fff`
                              }
                              alt={user.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <span
                              className={`absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-1 ring-white ${
                                user.status === "BUSY"
                                  ? "bg-red-400"
                                  : user.status === "AWAY"
                                  ? "bg-yellow-400"
                                  : "bg-gray-400"
                              }`}
                            ></span>
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            {user.name}
                          </span>
                          <span className="ml-auto text-xs text-gray-500">
                            {user.status === "BUSY"
                              ? "Ocupat"
                              : user.status === "AWAY"
                              ? "Plecat"
                              : "Offline"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-gray-100">
                  <button className="w-full flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Adaugă membri
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* More Options */}
          <button className="text-gray-600 hover:text-gray-900 focus:outline-none">
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
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
