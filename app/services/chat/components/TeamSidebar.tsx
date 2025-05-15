// components/TeamsChat/TeamsSidebar.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  HomeIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

interface UserDisplay {
  id: string;
  name: string;
  avatar?: string;
  status: string;
}

interface Message {
  id: string;
  sender: UserDisplay;
  content: string;
  timestamp: string;
  attachments: any[];
  reactions: any[];
  isRead: boolean;
}

interface PrivateChat {
  id: string;
  participants: UserDisplay[];
  unreadCount: number;
  lastMessage?: Message;
}

interface Channel {
  id: string;
  teamId: string;
  name: string;
  description?: string;
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

interface TeamsSidebarProps {
  teams: Team[];
  selectedTeam: Team | null;
  selectedChannel: Channel | null;
  privateChats: PrivateChat[];
  selectedPrivateChat: PrivateChat | null;
  onTeamSelect: (teamId: string) => void;
  onChannelSelect: (channelId: string) => void;
  onPrivateChatSelect: (chat: PrivateChat) => void;
  onStartPrivateChat: (userId: string) => void;
  isMobileSidebarOpen: boolean;
  onMobileSidebarClose: () => void;
  users?: UserDisplay[];
  currentUserId?: string;
}

const TeamsSidebar: React.FC<TeamsSidebarProps> = ({
  teams,
  selectedTeam,
  selectedChannel,
  privateChats,
  selectedPrivateChat,
  onTeamSelect,
  onChannelSelect,
  onPrivateChatSelect,
  onStartPrivateChat,
  isMobileSidebarOpen,
  onMobileSidebarClose,
  users = [],
  currentUserId = "",
}) => {
  const router = useRouter();
  const [expandedTeams, setExpandedTeams] = useState<string[]>([
    selectedTeam?.id || "",
  ]);
  const [showAllUsers, setShowAllUsers] = useState(false);

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

    onMobileSidebarClose();
  };

  const handleChannelClick = (channelId: string) => {
    onChannelSelect(channelId);
    onMobileSidebarClose();
  };

  const handleUserClick = (userId: string) => {
    onStartPrivateChat(userId);
    onMobileSidebarClose();
  };

  const navigateToDashboard = () => {
    router.push("/dashboard");
    onMobileSidebarClose();
  };

  const navigateToProfile = () => {
    router.push("/profile");
    onMobileSidebarClose();
  };

  // Filter out the current user from the users list
  const filteredUsers = users.filter((user) => user.id !== currentUserId);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onMobileSidebarClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out z-30`}
      >
        <div className="flex flex-col h-full">
          {/* Header with Dashboard button */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Teams</h2>
              <div className="flex">
                <button
                  onClick={navigateToProfile}
                  className="flex items-center justify-center p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150 mr-2"
                  title="Settings"
                >
                  <CogIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={navigateToDashboard}
                  className="flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                  title="Go to Dashboard"
                >
                  <HomeIcon className="w-5 h-5" />
                  <span className="ml-2 text-sm font-medium">Dashboard</span>
                </button>
              </div>
            </div>
          </div>

          {/* Teams List */}
          <div className="flex-1 overflow-y-auto">
            {teams.map((team) => (
              <div key={team.id} className="p-2">
                <div
                  className={`flex items-center p-2 rounded-lg cursor-pointer ${
                    selectedTeam?.id === team.id
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleTeamClick(team.id)}
                >
                  <img
                    src={team.icon}
                    alt={team.name}
                    className="w-8 h-8 rounded-lg mr-3"
                  />
                  <span className="font-medium">{team.name}</span>
                  {team.unreadCount > 0 && (
                    <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {team.unreadCount}
                    </span>
                  )}
                </div>

                {/* Channels */}
                {selectedTeam?.id === team.id && (
                  <div className="ml-8 mt-2 space-y-1">
                    {team.channels.map((channel) => (
                      <div
                        key={channel.id}
                        className={`flex items-center p-2 rounded-lg cursor-pointer ${
                          selectedChannel?.id === channel.id
                            ? "bg-blue-50 text-blue-600"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => handleChannelClick(channel.id)}
                      >
                        <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
                        <span>{channel.name}</span>
                        {channel.unreadCount > 0 && (
                          <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            {channel.unreadCount}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Team Members Section */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Team Members</h3>
                <button
                  onClick={() => setShowAllUsers(!showAllUsers)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <UserGroupIcon className="w-5 h-5" />
                </button>
              </div>

              {showAllUsers && (
                <div className="space-y-2">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100"
                        onClick={() => handleUserClick(user.id)}
                      >
                        <img
                          src={user.avatar || "/default-avatar.png"}
                          alt={user.name}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.status}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-2 text-gray-500">
                      No users found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Private Chats Section */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Direct Messages</h3>
                <button
                  onClick={() => setShowAllUsers(true)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {privateChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`flex items-center p-2 rounded-lg cursor-pointer ${
                      selectedPrivateChat?.id === chat.id
                        ? "bg-blue-50 text-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => onPrivateChatSelect(chat)}
                  >
                    <img
                      src={chat.participants[0].avatar || "/default-avatar.png"}
                      alt={chat.participants[0].name}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {chat.participants[0].name}
                      </div>
                      {chat.lastMessage && (
                        <div className="text-sm text-gray-500 truncate">
                          {chat.lastMessage.content}
                        </div>
                      )}
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamsSidebar;
