"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUsers,
  FiMessageSquare,
  FiCalendar,
  FiFile,
  FiPlus,
  FiArrowRight,
  FiKey,
} from "react-icons/fi";
import UpcomingEvents from "./UpcomingEvents";
import ActiveUsers from "./ActiveUsers";
import Channel from "@/app/types/models_types/channel";
import { UserTeam as User } from "@/app/types/models_types/userType";
import Team from "@/app/types/models_types/team";
import File from "@/app/types/models_types/file";
import { api as axios } from "@/app/lib/api";
import EnterTeamModal from "./EnterTeamModal";
import { getFullName, getAvatarUrl } from "@/app/lib/userUtils";

interface BackendFile {
  id: string;
  teamId: string;
  channelId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedById: string;
  uploadedAt: string;
  url: string;
}

interface TeamsOverviewProps {
  teams: Team[];
  users: User[];
  teamFiles: BackendFile[];
  onSelectTeam: (teamId: string) => void;
  onStartChat: (userId: string) => void;
  onJoinChannel: (teamId: string, channelId: string) => void;
  onCreateTeam: () => void;
  onEnterTeamById?: (teamId: string) => void;
}

const TeamsOverview: React.FC<TeamsOverviewProps> = ({
  teams = [],
  users = [],
  teamFiles = [],
  onSelectTeam,
  onStartChat,
  onJoinChannel,
  onCreateTeam,
  onEnterTeamById,
}) => {
  const router = useRouter();
  const [totalChannels, setTotalChannels] = useState(0);
  const [showEnterTeamModal, setShowEnterTeamModal] = useState<boolean>(false);
  const [stats, setStats] = useState({
    totalTeams: teams.length,
    totalUsers: users.length,
    totalChannels: 0,
    totalFiles: teamFiles.length,
    totalEvents: 0,
  });

  useEffect(() => {
    const loadTotalChannels = async () => {
      try {
        const channelsPromises = teams.map((team) =>
          fetchTeamChannels(team.id.toString())
        );

        const allChannels = await Promise.all(channelsPromises);
        const total = allChannels.reduce(
          (sum, channels) => sum + channels.length,
          0
        );
        setTotalChannels(total);
        setStats((prev) => ({ ...prev, totalChannels: total }));
      } catch (error) {
        console.error("Error calculating total channels:", error);
        setTotalChannels(0);
      }
    };

    loadTotalChannels();
  }, [teams]);

  const handleEnterTeamById = async (teamId: string) => {
    try {
      if (onEnterTeamById) {
        await onEnterTeamById(teamId);
        setShowEnterTeamModal(false);
      }
    } catch (error) {
      console.error("Error joining team:", error);
    }
  };

  const fetchTeamChannels = async (teamId: string): Promise<Channel[]> => {
    try {
      const response = await axios.get<Channel[]>(
        `/api/teams/${teamId}/channels`
      );
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching channels for team ${teamId}:`, error);
      return [];
    }
  };

  const onlineUsers = users.filter((user) => user.status === "ONLINE");

  const handleStartChat = (userId: string) => {
    router.push(`/chat?userId=${userId}`);
  };

  return (
    <div className="flex flex-col h-full overflow-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Teams Overview
          </h1>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEnterTeamModal(true)}
              className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors duration-200 text-sm sm:text-base"
            >
              <FiKey className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
              Join Team by ID
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCreateTeam}
              className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm sm:text-base"
            >
              <FiPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
              Create New Team
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-blue-100 text-blue-600">
                <FiUsers className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  Total Teams
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {stats.totalTeams}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600">
                <FiMessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  Total Channels
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {stats.totalChannels}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-purple-100 text-purple-600">
                <FiCalendar className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  Events
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {stats.totalEvents || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FiFile className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  Total Files
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {stats.totalFiles}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Teams Grid */}
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
              Your Teams
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {teams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden"
                >
                  <div
                    className={`h-1 ${
                      team.unreadCount && team.unreadCount > 0
                        ? "bg-blue-600"
                        : "bg-gray-200"
                    }`}
                  />
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center mb-3 sm:mb-4">
                      <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">
                        {team.icon}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900">
                          {team.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {team.channels ? team.channels.length : 0} channels
                        </p>
                      </div>
                      {team.unreadCount && team.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                          {team.unreadCount}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6 line-clamp-2">
                      {team.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {Array.isArray(team.members) &&
                        team.members.length > 0 ? (
                          team.members.slice(0, 3).map((memberId) => {
                            const user = users.find((u) => u.id === memberId);
                            return user ? (
                              <img
                                key={user.id}
                                src={getAvatarUrl(user)}
                                alt={getFullName(user)}
                                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white"
                              />
                            ) : null;
                          })
                        ) : (
                          <span className="text-xs sm:text-sm text-gray-500">
                            No members
                          </span>
                        )}

                        {Array.isArray(team.members) &&
                          team.members.length > 3 && (
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                +{team.members.length - 3}
                              </span>
                            </div>
                          )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelectTeam(team.id)}
                        className="flex items-center text-blue-600 hover:text-blue-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-xs sm:text-sm"
                      >
                        View Details
                        <FiArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-4 sm:space-y-6">
            <UpcomingEvents teams={teams} users={users} />
            <ActiveUsers users={onlineUsers} onStartChat={handleStartChat} />
          </div>
        </div>
      </div>

      {/* Enter Team Modal */}
      <AnimatePresence>
        {showEnterTeamModal && (
          <EnterTeamModal
            onClose={() => setShowEnterTeamModal(false)}
            onEnterTeam={handleEnterTeamById}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamsOverview;
