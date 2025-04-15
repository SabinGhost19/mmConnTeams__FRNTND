// components/TeamsLanding/TeamsSidebar.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/auth-context";
import { getFullName, getAvatarUrl } from "@/app/lib/userUtils";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiSearch,
  FiPlus,
  FiLogOut,
  FiChevronLeft,
  FiHome,
} from "react-icons/fi";

interface TeamsSidebarProps {
  teams: any[];
  selectedTeamId: string | null;
  onSelectTeam: (teamId: string) => void;
  onCreateTeam: () => void;
  onBackToOverview: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

const TeamsSidebar: React.FC<TeamsSidebarProps> = ({
  teams,
  selectedTeamId,
  onSelectTeam,
  onCreateTeam,
  onBackToOverview,
  isMobile = false,
  onClose,
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();

  // Filtrează echipele după textul căutat
  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navighează către pagina de chat
  const goToChat = () => {
    router.push("/teams");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FiUsers className="h-6 w-6" />
            <h1 className="font-semibold text-lg">Teams</h1>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <button
            onClick={onBackToOverview}
            className="w-full flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          >
            <FiHome className="h-5 w-5 mr-3" />
            <span className="text-sm font-medium">Back to Overview</span>
          </button>

          <h3 className="font-medium text-xs uppercase text-gray-500 px-2">
            Your Teams
          </h3>

          <ul className="space-y-1">
            {filteredTeams.map((team) => (
              <motion.li
                key={team.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => onSelectTeam(team.id)}
                  className={`flex items-center justify-between w-full p-2 rounded-lg transition-all duration-200 ${
                    selectedTeamId === team.id
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "hover:bg-gray-50 text-gray-700"
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
              </motion.li>
            ))}
          </ul>

          {/* Create team button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4"
          >
            <button
              onClick={onCreateTeam}
              className="w-full flex items-center justify-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg border border-blue-200 transition-all duration-200"
            >
              <FiPlus className="h-5 w-5 mr-2" />
              <span>Create New Team</span>
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* User Profile with Logout */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center">
          <div className="relative">
            <img
              src={
                user
                  ? getAvatarUrl(user)
                  : "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
              }
              alt="User Profile"
              className="w-10 h-10 rounded-full ring-2 ring-white"
            />
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400"></span>
          </div>
          <div className="ml-3 flex-1">
            <p className="font-medium text-sm text-gray-900">
              {user ? getFullName(user) : "User"}
            </p>
            <p className="text-xs text-gray-500">Online</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={logout}
            className="p-2 text-gray-500 hover:text-red-500 focus:outline-none transition-colors duration-200"
            title="Logout"
          >
            <FiLogOut className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TeamsSidebar;
