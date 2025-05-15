import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  avatar?: string;
  status: string;
}

interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  unreadCount: number;
}

interface Team {
  id: string;
  name: string;
  icon: string;
  description?: string;
  unreadCount: number;
  channels: Channel[];
}

interface PrivateChat {
  id: string;
  participants: User[];
  unreadCount: number;
}

interface TeamsSidebarProps {
  teams: Team[];
  selectedTeam: Team | null;
  selectedChannel: Channel | null;
  onTeamSelect: (teamId: string) => void;
  onChannelSelect: (channelId: string) => void;
  privateChats: PrivateChat[];
  selectedPrivateChat: PrivateChat | null;
  onPrivateChatSelect: (chat: PrivateChat) => void;
  onStartPrivateChat: (userId: string) => void;
  isMobileSidebarOpen: boolean;
  onMobileSidebarClose: () => void;
  users: User[];
  currentUserId: string;
}

const TeamsSidebar: React.FC<TeamsSidebarProps> = ({
  teams,
  selectedTeam,
  selectedChannel,
  onTeamSelect,
  onChannelSelect,
  privateChats,
  selectedPrivateChat,
  onPrivateChatSelect,
  onStartPrivateChat,
  isMobileSidebarOpen,
  onMobileSidebarClose,
  users,
  currentUserId,
}) => {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Handle user click to start a private chat
  const handleUserClick = (userId: string) => {
    onStartPrivateChat(userId);
    onMobileSidebarClose();
  };

  // Funcție pentru navigare către profilul utilizatorului
  const navigateToProfile = () => {
    router.push("/profile");
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Teams</h2>
          <button
            onClick={navigateToProfile}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-150"
            title="Profile Settings"
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

        {/* Teams section */}
        <div className="mt-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() =>
              setExpandedSection(expandedSection === "teams" ? null : "teams")
            }
          >
            <span className="text-sm font-medium text-gray-700">Teams</span>
            <svg
              className={`w-4 h-4 text-gray-500 transform ${
                expandedSection === "teams" ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* Teams list */}
          {expandedSection === "teams" && (
            <div className="mt-2 space-y-1">
              {teams.map((team) => (
                <div key={team.id} className="mt-2">
                  <div
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md cursor-pointer ${
                      selectedTeam?.id === team.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => onTeamSelect(team.id)}
                  >
                    <img
                      src={team.icon || "/default-team-icon.png"}
                      alt={team.name}
                      className="h-5 w-5 mr-2"
                    />
                    <span>{team.name}</span>
                    {team.unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {team.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Channels for selected team */}
                  {selectedTeam?.id === team.id && (
                    <div className="ml-4 mt-1 space-y-1">
                      {team.channels.map((channel) => (
                        <div
                          key={channel.id}
                          className={`flex items-center px-4 py-2 text-sm rounded-md cursor-pointer ${
                            selectedChannel?.id === channel.id
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={() => onChannelSelect(channel.id)}
                        >
                          <span className="mr-2">#</span>
                          <span>{channel.name}</span>
                          {channel.unreadCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                              {channel.unreadCount}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Private Chats section */}
        <div className="mt-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() =>
              setExpandedSection(
                expandedSection === "private" ? null : "private"
              )
            }
          >
            <span className="text-sm font-medium text-gray-700">
              Private Chats
            </span>
            <svg
              className={`w-4 h-4 text-gray-500 transform ${
                expandedSection === "private" ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* Private chats list */}
          {expandedSection === "private" && (
            <div className="mt-2 space-y-1">
              {privateChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex items-center px-4 py-2 text-sm rounded-md cursor-pointer ${
                    selectedPrivateChat?.id === chat.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => onPrivateChatSelect(chat)}
                >
                  <div className="relative">
                    <img
                      src={
                        chat.participants.find((p) => p.id !== currentUserId)
                          ?.avatar || "/default-avatar.png"
                      }
                      alt={
                        chat.participants.find((p) => p.id !== currentUserId)
                          ?.name || "User"
                      }
                      className="h-6 w-6 rounded-full"
                    />
                    <span
                      className={`absolute bottom-0 right-0 block h-2 w-2 rounded-full ${
                        chat.participants.find((p) => p.id !== currentUserId)
                          ?.status === "online"
                          ? "bg-green-400"
                          : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <span className="ml-3">
                    {
                      chat.participants.find((p) => p.id !== currentUserId)
                        ?.name
                    }
                  </span>
                  {chat.unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Users section */}
        <div className="mt-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() =>
              setExpandedSection(expandedSection === "users" ? null : "users")
            }
          >
            <span className="text-sm font-medium text-gray-700">Users</span>
            <svg
              className={`w-4 h-4 text-gray-500 transform ${
                expandedSection === "users" ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* User list */}
          {expandedSection === "users" && (
            <div className="mt-2 space-y-1">
              {users
                .filter((user) => user.id !== currentUserId)
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer rounded-md"
                    onClick={() => handleUserClick(user.id)}
                  >
                    <div className="relative">
                      <img
                        src={user.avatar || "/default-avatar.png"}
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                      />
                      <span
                        className={`absolute bottom-0 right-0 block h-2 w-2 rounded-full ${
                          user.status === "online"
                            ? "bg-green-400"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <span className="ml-3">{user.name}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamsSidebar;
