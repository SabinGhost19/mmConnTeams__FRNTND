// components/TeamsChat/TeamsSidebar.tsx
"use client";
import React, { useState } from "react";

interface TeamsSidebarProps {
  teams: any[];
  selectedTeam: any;
  selectedChannel: any;
  onTeamSelect: (teamId: string) => void;
  onChannelSelect: (channelId: string) => void;
  onCloseMobileSidebar: () => void;
}

const TeamsSidebar: React.FC<TeamsSidebarProps> = ({
  teams,
  selectedTeam,
  selectedChannel,
  onTeamSelect,
  onChannelSelect,
  onCloseMobileSidebar,
}) => {
  const [expandedTeams, setExpandedTeams] = useState<string[]>([
    selectedTeam.id,
  ]);

  const toggleTeamExpand = (teamId: string) => {
    if (expandedTeams.includes(teamId)) {
      setExpandedTeams(expandedTeams.filter((id) => id !== teamId));
    } else {
      setExpandedTeams([...expandedTeams, teamId]);
    }
  };

  const handleTeamClick = (teamId: string) => {
    onTeamSelect(teamId);

    // Expand the team if it's not already expanded
    if (!expandedTeams.includes(teamId)) {
      setExpandedTeams([...expandedTeams, teamId]);
    }

    onCloseMobileSidebar();
  };

  const handleChannelClick = (channelId: string) => {
    onChannelSelect(channelId);
    onCloseMobileSidebar();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Sidebar Header */}
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
            <h1 className="font-semibold">Teams Chat</h1>
          </div>
          <div className="md:hidden">
            <button
              onClick={onCloseMobileSidebar}
              className="text-white focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
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
            placeholder="Caută..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Teams List */}
      <div className="flex-1 overflow-y-auto p-2">
        <ul>
          {teams.map((team) => (
            <li key={team.id} className="mb-1">
              {/* Team Header */}
              <div
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                  selectedTeam.id === team.id
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-200"
                }`}
              >
                <div
                  className="flex items-center flex-1"
                  onClick={() => handleTeamClick(team.id)}
                >
                  <span className="text-xl mr-2">{team.icon}</span>
                  <span className="font-medium">{team.name}</span>
                  {team.unreadCount > 0 && (
                    <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {team.unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => toggleTeamExpand(team.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-transform ${
                      expandedTeams.includes(team.id)
                        ? "transform rotate-180"
                        : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {/* Channels */}
              {expandedTeams.includes(team.id) && (
                <ul className="ml-8 mt-1 space-y-1">
                  {team.channels.map(
                    (channel: {
                      id: React.Key | null | undefined;
                      name:
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<
                            unknown,
                            string | React.JSXElementConstructor<any>
                          >
                        | Iterable<React.ReactNode>
                        | React.ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactPortal
                            | React.ReactElement<
                                unknown,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined;
                      unreadCount:
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<
                            unknown,
                            string | React.JSXElementConstructor<any>
                          >
                        | Iterable<React.ReactNode>
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactPortal
                            | React.ReactElement<
                                unknown,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined;
                    }) => (
                      <li
                        key={channel.id}
                        className={`flex items-center px-2 py-1.5 rounded-md cursor-pointer ${
                          selectedChannel.id === channel.id &&
                          selectedTeam.id === team.id
                            ? "bg-gray-200 font-medium"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                        onClick={() => handleChannelClick(channel.id)}
                      >
                        <span className="text-gray-400 mr-2">#</span>
                        <span>{channel.name}</span>
                        {channel.unreadCount > 0 && (
                          <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {channel.unreadCount}
                          </span>
                        )}
                      </li>
                    )
                  )}

                  {/* Add Channel Button */}
                  <li className="flex items-center px-2 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
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
                    <span className="text-sm">Adaugă canal</span>
                  </li>
                </ul>
              )}
            </li>
          ))}
        </ul>

        {/* Add Team Button */}
        <div className="mt-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md cursor-pointer">
          <div className="flex items-center">
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
            <span>Adaugă o echipă nouă</span>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="relative">
            <img
              src="https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
              alt="User Profile"
              className="w-10 h-10 rounded-full"
            />
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400"></span>
          </div>
          <div className="ml-3">
            <p className="font-medium text-sm">Ana Popescu</p>
            <p className="text-xs text-gray-500">Online</p>
          </div>
          <div className="ml-auto">
            <button className="text-gray-400 hover:text-gray-600 focus:outline-none">
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
    </div>
  );
};

export default TeamsSidebar;
