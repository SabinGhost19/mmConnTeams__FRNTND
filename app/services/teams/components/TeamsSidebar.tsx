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
  FiGrid,
  FiCompass,
  FiLayout,
  FiActivity,
  FiZap,
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

  // Navighează către pagina de dashboard
  const navigateToDashboard = () => {
    router.push("/dashboard");
  };

  // Navighează către pagina de chat
  const goToChat = () => {
    router.push("/teams");
  };

  // Navighează către pagina de profil
  const goToProfile = () => {
    router.push("/profile");
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white rounded-r-2xl shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 sm:p-5 rounded-tr-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-full shadow-inner">
              <FiUsers className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h1 className="font-bold text-lg sm:text-xl tracking-tight">
              Teams
            </h1>
          </div>
          {isMobile && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-all duration-200"
            >
              <FiChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Dashboard Button - Redesigned with Rocket icon */}
      <div className="px-4 py-3 border-b border-gray-200">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={navigateToDashboard}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-md transition-all duration-200"
        >
          <span className="flex items-center">
            <FiZap className="h-5 w-5 mr-3" />
            <span className="text-sm font-semibold">Dashboard</span>
          </span>
          <span className="bg-white/20 rounded-full p-1">
            <FiCompass className="h-4 w-4" />
          </span>
        </motion.button>
      </div>

      {/* Search */}
      <div className="p-3 sm:p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-gray-100 border-0 rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 shadow-inner"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 sm:space-y-5"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBackToOverview}
            className="w-full flex items-center p-2 sm:p-2.5 text-gray-700 hover:text-blue-700 bg-white hover:bg-blue-50 rounded-xl shadow-sm transition-all duration-200 border border-gray-100"
          >
            <div className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-blue-100 text-blue-600 mr-2 sm:mr-3">
              <FiLayout className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <span className="text-xs sm:text-sm font-medium">
              Back to Overview
            </span>
          </motion.button>

          <div className="flex items-center justify-between px-2">
            <h3 className="font-semibold text-xs uppercase text-gray-500 tracking-wider">
              Your Teams
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-2"></div>
          </div>

          <ul className="space-y-1.5 sm:space-y-2">
            {filteredTeams.map((team) => (
              <motion.li
                key={team.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <button
                  onClick={() => onSelectTeam(team.id)}
                  className={`flex items-center justify-between w-full p-2 sm:p-2.5 rounded-xl transition-all duration-200 ${
                    selectedTeamId === team.id
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 text-blue-700 shadow-sm"
                      : "hover:bg-gray-50 text-gray-700 border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden bg-white shadow-sm mr-2 sm:mr-3">
                      {team.iconUrl ? (
                        <img
                          src={team.iconUrl}
                          alt={`${team.name} icon`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const iconSpan = document.createElement("span");
                              iconSpan.className = "text-lg sm:text-xl";
                              iconSpan.textContent =
                                team.icon || team.name.charAt(0);
                              parent.appendChild(iconSpan);
                            }
                          }}
                        />
                      ) : (
                        <span className="text-lg sm:text-xl">
                          {team.icon || team.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="font-medium truncate text-sm sm:text-base">
                      {team.name}
                    </span>
                  </div>
                  {team.unreadCount > 0 && (
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm">
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
            className="mt-3 sm:mt-4 px-2"
          >
            <button
              onClick={onCreateTeam}
              className="w-full flex items-center justify-center p-2.5 sm:p-3 text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl shadow-sm transition-all duration-200"
            >
              <FiPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
              <span className="font-medium text-sm sm:text-base">
                Create New Team
              </span>
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* User Profile with Logout */}
      <div className="p-3 sm:p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 rounded-br-2xl">
        <div className="flex items-center">
          <div className="relative">
            <img
              src={
                user
                  ? getAvatarUrl(user)
                  : "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
              }
              alt="User Profile"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full ring-2 ring-white shadow-md"
            />
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ring-2 ring-white bg-green-400"></span>
          </div>
          <div className="ml-2 sm:ml-3 flex-1">
            <p className="font-medium text-xs sm:text-sm text-gray-900">
              {user ? getFullName(user) : "User"}
            </p>
            <p className="text-xs text-green-600 font-medium">Online</p>
          </div>
          <div className="flex space-x-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToProfile}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full focus:outline-none transition-all duration-200"
              title="Settings"
            >
              <FiSettings className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={logout}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full focus:outline-none transition-all duration-200"
              title="Logout"
            >
              <FiLogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsSidebar;
