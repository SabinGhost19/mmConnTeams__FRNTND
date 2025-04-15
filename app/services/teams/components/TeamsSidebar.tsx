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
  FiSettings,
  FiStar,
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
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white rounded-r-2xl shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-5 rounded-tr-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full shadow-inner">
              <FiUsers className="h-6 w-6" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">Teams</h1>
          </div>
          {isMobile && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-all duration-200"
            >
              <FiChevronLeft className="h-5 w-5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 shadow-inner"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBackToOverview}
            className="w-full flex items-center p-2.5 text-gray-700 hover:text-blue-700 bg-white hover:bg-blue-50 rounded-xl shadow-sm transition-all duration-200 border border-gray-100"
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 mr-3">
              <FiHome className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Back to Overview</span>
          </motion.button>

          <div className="flex items-center justify-between px-2">
            <h3 className="font-semibold text-xs uppercase text-gray-500 tracking-wider">
              Your Teams
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-2"></div>
          </div>

          <ul className="space-y-2">
            {filteredTeams.map((team) => (
              <motion.li
                key={team.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <button
                  onClick={() => onSelectTeam(team.id)}
                  className={`flex items-center justify-between w-full p-2.5 rounded-xl transition-all duration-200 ${
                    selectedTeamId === team.id
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 text-blue-700 shadow-sm"
                      : "hover:bg-gray-50 text-gray-700 border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-9 w-9 rounded-full bg-white shadow-sm text-xl mr-3">
                      {team.icon}
                    </div>
                    <span className="font-medium truncate">{team.name}</span>
                  </div>
                  {team.unreadCount > 0 && (
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-2.5 py-1 rounded-full shadow-sm">
                      {team.unreadCount}
                    </span>
                  )}
                </button>
              </motion.li>
            ))}
          </ul>

          {/* Create team button */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-4 px-2"
          >
            <button
              onClick={onCreateTeam}
              className="w-full flex items-center justify-center p-3 text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl shadow-sm transition-all duration-200"
            >
              <FiPlus className="h-5 w-5 mr-2" />
              <span className="font-medium">Create New Team</span>
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* User Profile with Logout */}
      <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 rounded-br-2xl">
        <div className="flex items-center">
          <div className="relative">
            <img
              src={
                user
                  ? getAvatarUrl(user)
                  : "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
              }
              alt="User Profile"
              className="w-10 h-10 rounded-full ring-2 ring-white shadow-md"
            />
            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-400"></span>
          </div>
          <div className="ml-3 flex-1">
            <p className="font-medium text-sm text-gray-900">
              {user ? getFullName(user) : "User"}
            </p>
            <p className="text-xs text-green-600 font-medium">Online</p>
          </div>
          <div className="flex space-x-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full focus:outline-none transition-all duration-200"
              title="Settings"
            >
              <FiSettings className="h-5 w-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full focus:outline-none transition-all duration-200"
              title="Logout"
            >
              <FiLogOut className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsSidebar;
