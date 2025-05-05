"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUsers,
  FiMessageSquare,
  FiCalendar,
  FiFile,
  FiPlus,
  FiBell,
  FiCopy,
  FiChevronRight,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiUpload,
  FiDownload,
  FiTrash2,
  FiShare2,
} from "react-icons/fi";
import ChannelList from "./ChannelList";
import MembersList from "./MembersList";
import TeamCalendar from "./TeamCalendar";
import TeamFiles from "./TeamFiles";
import CreateEventModal from "./CreateEventModal";
import EnterTeamModal from "./EnterTeamModal";
import NotificationModal, { Notification } from "./NotificationModal";
import FileUploadModal from "./FileUploadModal";
import Channel from "@/app/types/models_types/channel";
import { UserTeam as Member } from "@/app/types/models_types/userType";
import Team from "@/app/types/models_types/team";
import Event from "@/app/types/models_types/event";
import File from "@/app/types/models_types/file";
import { NewEventWithAttendees } from "@/app/types/models_types/eventTypes";
import { getFullName, getAvatarUrl } from "@/app/lib/userUtils";
import { api as axios } from "@/app/lib/api";

// Import ViewType enum from TeamsLandingPage
import { ViewType } from "../TeamsLandingPage";

// Interface for backend file response
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
  awsS3Key?: string;
}

interface TeamDetailViewProps {
  team: Team;
  users: Member[];
  events: Event[];
  files: BackendFile[];
  selectedView: ViewType;
  onChangeView: (view: ViewType) => void;
  onStartChat: (userId: string) => void;
  onJoinChannel: (teamId: string, channelId: string) => void;
  onCreateChannel: (channelName: string) => void;
  onInviteUser: () => void;
  onSelectChannel: (channelId: string) => void;
  onCreateEvent?: (event: NewEventWithAttendees) => void;
  onEnterTeamById?: (teamId: string) => Promise<any>;
  onFetchNotifications?: () => Promise<Notification[]>;
  onMarkNotificationAsRead?: (notificationId: string) => Promise<void>;
  onJoinTeam?: (teamId: string, notificationId: string) => Promise<void>;
  onRejectTeamInvite?: (
    teamId: string,
    notificationId: string
  ) => Promise<void>;
  onFileUpload?: (
    file: Blob,
    teamId: string,
    channelId: string,
    fileName: string
  ) => Promise<any>;
  onAddMember: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
  onUpdateMemberRole: (userId: string, role: string) => void;
  onUploadFile: (file: BackendFile) => void;
  onDeleteFile: (fileId: string) => void;
  onShareFile: (fileId: string, userIds: string[]) => void;
  onScheduleEvent: (event: Event) => void;
  onUpdateEvent: (eventId: string, updates: Partial<Event>) => void;
  onDeleteEvent: (eventId: string) => void;
  onJoinEvent: (eventId: string) => void;
  onLeaveEvent: (eventId: string) => void;
  onEnterTeam: (teamId: string) => void;
  onLeaveTeam: (teamId: string) => void;
  onUpdateTeam: (updates: Partial<Team>) => void;
  onDeleteTeam: (teamId: string) => void;
  onDownloadFile: (fileId: string) => void;
}

const TeamDetailView: React.FC<TeamDetailViewProps> = ({
  team,
  users,
  events,
  files,
  selectedView,
  onChangeView,
  onStartChat,
  onJoinChannel,
  onCreateChannel,
  onInviteUser,
  onSelectChannel,
  onCreateEvent,
  onEnterTeamById,
  onFetchNotifications,
  onMarkNotificationAsRead,
  onJoinTeam,
  onRejectTeamInvite,
  onFileUpload,
  onAddMember,
  onRemoveMember,
  onUpdateMemberRole,
  onUploadFile,
  onDeleteFile,
  onShareFile,
  onScheduleEvent,
  onUpdateEvent,
  onDeleteEvent,
  onJoinEvent,
  onLeaveEvent,
  onEnterTeam,
  onLeaveTeam,
  onUpdateTeam,
  onDeleteTeam,
  onDownloadFile,
}) => {
  const router = useRouter();

  // State pentru modale
  const [showCreateEventModal, setShowCreateEventModal] =
    useState<boolean>(false);
  const [showEnterTeamModal, setShowEnterTeamModal] = useState<boolean>(false);
  const [showNotificationsModal, setShowNotificationsModal] =
    useState<boolean>(false);

  // State pentru afișarea ID-ului echipei
  const [showTeamId, setShowTeamId] = useState<boolean>(false);

  // State pentru notificări
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] =
    useState<number>(0);
  const [isLoadingNotifications, setIsLoadingNotifications] =
    useState<boolean>(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [teamFiles, setTeamFiles] = useState<BackendFile[]>(files);
  const [showFileUploadModal, setShowFileUploadModal] =
    useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(
    null
  );

  // Fetch files when view changes to "files"
  useEffect(() => {
    if (selectedView === ViewType.FILES) {
      fetchTeamFiles();
    }
  }, [selectedView, team.id]);

  // Function to fetch all files for a team
  const fetchTeamFiles = async () => {
    if (!team.id) return;

    setIsLoadingFiles(true);
    try {
      const response = await axios.get<BackendFile[]>(
        `/api/files/all/${team.id}`
      );
      setTeamFiles(response.data);
      console.log("Team Files:", response.data);
    } catch (error) {
      console.error("Error fetching team files:", error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  ////!!!!!!!!!!!!!!!!!
  const handleEnterTeamById = async (teamId: string) => {
    console.log("Entering team with ID:", teamId);
    try {
      if (onEnterTeamById) {
        await onEnterTeamById(teamId);
        setShowEnterTeamModal(false);
      } else {
        console.error("onEnterTeamById prop is not provided");
      }
    } catch (error) {
      console.error("Error entering team:", error);
    }
  };
  // Fetch notificări la încărcarea componentei
  useEffect(() => {
    fetchNotifications();

    // Opțional: actualizam notificările la intervale regulate
    const intervalId = setInterval(fetchNotifications, 30000); // 30 secunde

    return () => clearInterval(intervalId);
  }, []);

  // Funcție pentru preluarea notificărilor
  const fetchNotifications = async () => {
    if (!onFetchNotifications) return;

    setIsLoadingNotifications(true);
    try {
      const data = await onFetchNotifications();
      setNotifications(data);
      setUnreadNotificationsCount(
        data.filter((notification) => !notification.isRead).length
      );
    } catch (error) {
      console.error("Eroare la preluarea notificărilor:", error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Funcție pentru marcarea unei notificări ca citită
  const handleMarkAsRead = async (notificationId: string) => {
    if (!onMarkNotificationAsRead) return;

    try {
      await onMarkNotificationAsRead(notificationId);

      // Actualizăm starea locală
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Recalculăm numărul de notificări necitite
      setUnreadNotificationsCount((prev) => prev - 1);
    } catch (error) {
      console.error("Eroare la marcarea notificării ca citită:", error);
    }
  };

  // Funcție pentru alăturarea la o echipă
  const handleJoinTeam = async (teamId: string, notificationId: string) => {
    if (!onJoinTeam) return;

    try {
      await onJoinTeam(teamId, notificationId);

      // Actualizăm starea locală
      await handleMarkAsRead(notificationId);

      // Opțional: închide modalul și afișează mesaj de succes
      setShowNotificationsModal(false);
    } catch (error) {
      console.error("Eroare la alăturarea la echipă:", error);
    }
  };

  // Funcție pentru respingerea invitației la echipă
  const handleRejectTeamInvite = async (
    teamId: string,
    notificationId: string
  ) => {
    if (!onRejectTeamInvite) return;

    try {
      await onRejectTeamInvite(teamId, notificationId);

      // Actualizăm starea locală
      await handleMarkAsRead(notificationId);
    } catch (error) {
      console.error("Eroare la respingerea invitației:", error);
    }
  };

  // Funcție pentru copierea ID-ului în clipboard
  const copyTeamId = () => {
    if (team?.id) {
      navigator.clipboard.writeText(team.id);
      // Feedback vizual pentru utilizator
      alert("ID-ul echipei a fost copiat în clipboard!");
    }
  };

  // Debugging console.log pentru a verifica starea modalului
  console.log("Modal state:", showCreateEventModal);

  const teamMembers = Array.isArray(users)
    ? users.filter((user) => team.members?.includes(user.id) || false)
    : [];

  const onlineMembers = Array.isArray(teamMembers)
    ? teamMembers.filter((user) => user.status === "ONLINE")
    : [];

  const totalChannels = team.channels?.length || 0;
  const totalFiles = teamFiles.length;
  const upcomingEvents = (events || []).filter((event) => {
    // Check if event is defined
    if (!event) return false;
    // Safely handle the date property regardless of event format
    if (!event.date) return false;
    try {
      return new Date(event.date) > new Date();
    } catch (e) {
      console.error("Invalid date format in event:", event);
      return false;
    }
  }).length;

  // Sortează canalele după numărul de mesaje necitite
  const sortedChannels = [...(team.channels || [])].sort(
    (a, b) => b.unreadCount - a.unreadCount
  );

  // Verifică dacă avem utilizatori pe echipă
  // și calculează numărul celor online
  const teamMembersCount = teamMembers ? teamMembers.length : 0;
  console.log("TeamDetailView: Members data:", teamMembers);
  console.log(
    "TeamDetailView: Member status values:",
    teamMembers?.map((user) => user.status)
  );
  const onlineTeamMembersCount = teamMembers
    ? teamMembers.filter((user) => user.status === "ONLINE").length
    : 0;

  // Handler pentru crearea unui eveniment nou
  const handleCreateEvent = (eventData: NewEventWithAttendees) => {
    if (onCreateEvent) {
      onCreateEvent(eventData);
    }
    setShowCreateEventModal(false);
  };

  // Funcție pentru a deschide modalul
  const openCreateEventModal = () => {
    setShowCreateEventModal(true);
    console.log("Opening modal");
  };

  // Create a function to handle redirecting to chat
  const handleStartChat = (userId: string) => {
    // Redirect to chat page with the user ID as query parameter
    router.push(`/chat?userId=${userId}`);
  };

  const handleFileSelect = (file: globalThis.File) => {
    setSelectedFile(file);
  };

  const handleFileUpload = async (
    file: Blob,
    teamId: string,
    channelId: string,
    fileName: string
  ) => {
    if (onFileUpload) {
      try {
        const response = await onFileUpload(file, teamId, channelId, fileName);
        // Refresh the files list after upload
        fetchTeamFiles();
        return response;
      } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
      }
    }
  };

  const handleDownloadFile = async (
    fileId: string,
    awsS3Key?: string,
    fileName?: string
  ) => {
    try {
      const response = await axios.get(`/api/files/download/${awsS3Key}`, {
        params: {
          awsS3Key,
          fileName,
        },
        responseType: "blob",
      });

      const file = teamFiles.find((f) => f.id === fileId);
      if (!file) return;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 shadow-sm rounded-b-xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md">
              <span className="text-lg sm:text-xl">{team.iconUrl}</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                {team.name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {team.description}
              </p>
              {showTeamId && team?.id && (
                <div className="flex items-center mt-1 sm:mt-2">
                  <span className="text-xs sm:text-sm text-gray-600 mr-2">
                    Team ID: {team.id}
                  </span>
                  <button
                    onClick={copyTeamId}
                    className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm flex items-center"
                  >
                    <FiCopy className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                    Copy
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTeamId(!showTeamId)}
              className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 shadow-sm"
            >
              <FiCopy className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              {showTeamId ? "Hide ID" : "Show ID"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotificationsModal(true)}
              className="relative flex items-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 shadow-sm"
            >
              <FiBell className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Notifications
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-1 sm:px-1.5 py-0.5 rounded-full shadow-sm">
                  {unreadNotificationsCount}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-2 shadow-sm">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide">
          {[
            { id: ViewType.TEAM_DETAIL, label: "Overview", icon: FiUsers },
            { id: ViewType.CHANNEL, label: "Channels", icon: FiMessageSquare },
            { id: ViewType.CHAT, label: "Chat", icon: FiMessageSquare },
            { id: ViewType.OVERVIEW, label: "Events", icon: FiCalendar },
            { id: ViewType.FILES, label: "Files", icon: FiFile },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onChangeView(tab.id)}
                className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
                  selectedView === tab.id
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 shadow-sm"
                }`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                {tab.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-3 sm:p-6 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            {selectedView === ViewType.TEAM_DETAIL && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div className="p-2 sm:p-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md">
                      <FiUsers className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-500">
                        Team Members
                      </p>
                      <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                        {teamMembersCount}
                      </p>
                      <p className="text-xs font-medium text-green-600">
                        {onlineMembers.length} online
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div className="p-2 sm:p-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white shadow-md">
                      <FiMessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-500">
                        Total Channels
                      </p>
                      <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                        {totalChannels}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div className="p-2 sm:p-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow-md">
                      <FiCalendar className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-500">
                        Upcoming Events
                      </p>
                      <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                        {upcomingEvents}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div className="p-2 sm:p-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-md">
                      <FiFile className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-500">
                        Total Files
                      </p>
                      <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                        {totalFiles}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {selectedView === ViewType.CHANNEL && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Channels Panel */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Channels</h3>
                  <ChannelList
                    teamId={team.id}
                    channels={team.channels || []}
                    onJoinChannel={onJoinChannel}
                    onCreateChannel={() => onCreateChannel("")}
                    onSelectChannel={onSelectChannel}
                  />
                </div>

                {/* Team Members Panel */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Team Members</h3>
                  <div className="overflow-y-auto max-h-[600px]">
                    {users.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => router.push(`/profile/${member.id}`)}
                        className="flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer rounded-md"
                      >
                        {member.profileImage ? (
                          <img
                            src={member.profileImage}
                            alt={`${member.firstName} ${member.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                            {member.firstName?.charAt(0)}
                            {member.lastName?.charAt(0)}
                          </div>
                        )}
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <span className="font-medium">
                              {member.firstName} {member.lastName}
                            </span>
                            {member.status === "online" && (
                              <span className="ml-2 h-2 w-2 rounded-full bg-green-400"></span>
                            )}
                          </div>
                          <p className="text-gray-500 text-sm">
                            {member.department || "No department"}
                          </p>
                        </div>
                        <div className="text-blue-500 hover:text-blue-700">
                          <FiChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {selectedView === ViewType.CHAT && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100"
              >
                <MembersList
                  teamId={team.id}
                  members={users}
                  onStartChat={handleStartChat}
                  onInviteUser={onInviteUser}
                  onAddMember={onAddMember}
                  onRemoveMember={onRemoveMember}
                  onUpdateMemberRole={onUpdateMemberRole}
                />
              </motion.div>
            )}

            {selectedView === ViewType.OVERVIEW && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
                    Events
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openCreateEventModal}
                    className="flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:shadow-lg transition-all duration-200 text-sm w-full sm:w-auto"
                  >
                    <FiPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Create Event
                  </motion.button>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-[320px] sm:min-w-0">
                    <TeamCalendar
                      teamId={team.id}
                      members={users}
                      channels={team.channels || []}
                      onCreateEvent={openCreateEventModal}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {selectedView === ViewType.FILES && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent">
                    Files
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowFileUploadModal(true)}
                    className="flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:shadow-lg transition-all duration-200 text-sm w-full sm:w-auto"
                  >
                    <FiPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Upload File
                  </motion.button>
                </div>

                {/* Mobile File View */}
                <div className="block sm:hidden">
                  <div className="overflow-x-auto">
                    <div className="min-w-[320px] sm:min-w-0">
                      <div className="space-y-3">
                        {teamFiles && teamFiles.length > 0 ? (
                          teamFiles.map((file) => (
                            <div
                              key={file.id}
                              className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="bg-blue-50 p-2 rounded-lg">
                                  <FiFile className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                                    {file.fileName}
                                  </h3>
                                  <p className="text-xs text-gray-500">
                                    {file.fileSize} •{" "}
                                    {new Date(
                                      file.uploadedAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                                  onClick={() =>
                                    handleDownloadFile(
                                      file.id,
                                      file.awsS3Key,
                                      file.fileName
                                    )
                                  }
                                >
                                  <FiDownload className="h-4 w-4" />
                                </button>
                                <button
                                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                                  onClick={() => onShareFile(file.id, [])}
                                >
                                  <FiShare2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <div className="bg-gray-50 rounded-full p-4 inline-block mb-3">
                              <FiFile className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-sm">
                              No files uploaded yet
                            </p>
                            <button
                              onClick={() => setShowFileUploadModal(true)}
                              className="mt-3 text-blue-600 text-sm font-medium"
                            >
                              Upload your first file
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop File View */}
                <div className="hidden sm:block overflow-x-auto">
                  <div className="min-w-[320px] sm:min-w-0">
                    <TeamFiles
                      teamId={team.id}
                      files={teamFiles}
                      channels={team.channels || []}
                      members={users}
                      onFileUpload={handleFileUpload}
                      isLoading={isLoadingFiles}
                      onUploadFile={(file, channelId, fileName) => {
                        if (onUploadFile) {
                          onUploadFile(file);
                        }
                      }}
                      onDeleteFile={onDeleteFile}
                      onDownloadFile={handleDownloadFile}
                      onShareFile={onShareFile}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <CreateEventModal
                teamId={team.id}
                userId={users[0]?.id || ""}
                channels={team.channels || []}
                onClose={() => setShowCreateEventModal(false)}
                onCreateEvent={handleCreateEvent}
              />
            </div>
          </div>
        )}
        {showEnterTeamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-md">
              <EnterTeamModal
                onClose={() => setShowEnterTeamModal(false)}
                onEnterTeam={handleEnterTeamById}
              />
            </div>
          </div>
        )}
        {showNotificationsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <NotificationModal
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onJoinTeam={handleJoinTeam}
                onRejectTeamInvite={handleRejectTeamInvite}
                onClose={() => setShowNotificationsModal(false)}
              />
            </div>
          </div>
        )}
        {showFileUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <FileUploadModal
                teamId={team.id}
                channels={team.channels || []}
                onClose={() => {
                  setShowFileUploadModal(false);
                  setSelectedFile(null);
                }}
                onUpload={handleFileUpload}
                isOpen={showFileUploadModal}
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamDetailView;
