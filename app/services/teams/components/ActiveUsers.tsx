// components/TeamsLanding/ActiveUsers.tsx
"use client";

import React from "react";

interface ActiveUsersProps {
  users: any[];
  onStartChat: (userId: number) => void;
}

const ActiveUsers: React.FC<ActiveUsersProps> = ({ users, onStartChat }) => {
  if (users.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="font-bold text-gray-800">Utilizatori online</h2>
      </div>

      <div className="p-4">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id} className="py-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.name
                      )}&background=0D8ABC&color=fff`
                    }
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.role}</p>
                </div>
                <button
                  onClick={() => onStartChat(user.id)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Start chat"
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>

        {users.length > 5 && (
          <div className="mt-4 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-800">
              Vezi toți ({users.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveUsers;
