// components/TeamsLanding/TeamsSidebar.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TeamsSidebarProps {
  teams: any[];
  selectedTeamId: number | null;
  onSelectTeam: (teamId: number) => void;
  onCreateTeam: () => void;
}

const TeamsSidebar: React.FC<TeamsSidebarProps> = ({
  teams,
  selectedTeamId,
  onSelectTeam,
  onCreateTeam,
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrează echipele după textul căutat
  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navighează către pagina de chat
  const goToChat = () => {
    router.push("/teams");
  };

  return (
    <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h1 className="font-semibold">Teams</h1>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Caută echipe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-4">
          <button
            onClick={goToChat}
            className="w-full flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
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
            <span>Chat</span>
          </button>

          <Link
            href="/calendar"
            className="w-full flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Calendar</span>
          </Link>

          <Link
            href="/files"
            className="w-full flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
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
            <span>Fișiere</span>
          </Link>
        </div>

        <h3 className="font-medium text-xs uppercase text-gray-500 px-2 py-2">
          Echipele tale
        </h3>

        {/* Teams List */}
        <ul>
          {filteredTeams.map((team) => (
            <li key={team.id} className="mb-1">
              <button
                onClick={() => onSelectTeam(team.id)}
                className={`flex items-center justify-between w-full p-2 rounded-md ${
                  selectedTeamId === team.id
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-200 text-gray-700"
                }`}
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">{team.icon}</span>
                  <span className="font-medium truncate">{team.name}</span>
                </div>
                {team.unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {team.unreadCount}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* Create team button */}
        <div className="mt-4">
          <button
            onClick={onCreateTeam}
            className="w-full flex items-center justify-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md border border-blue-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
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
            <span>Creează echipă nouă</span>
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="relative">
            <img
              src="https://ui-avatars.com/api/?name=Ana+Popescu&background=0D8ABC&color=fff"
              alt="User Profile"
              className="w-10 h-10 rounded-full"
            />
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400"></span>
          </div>
          <div className="ml-3">
            <p className="font-medium text-sm">Ana Popescu</p>
            <p className="text-xs text-gray-500">Online</p>
          </div>
          <button className="ml-auto text-gray-400 hover:text-gray-600 focus:outline-none">
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamsSidebar;
