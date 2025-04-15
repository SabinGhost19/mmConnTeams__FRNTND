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
} from "react-icons/fi";
import ChannelList from "./ChannelList";
import MembersList from "./MembersList";
import TeamCalendar from "./TeamCalendar";
import TeamFiles from "./TeamFiles";
import CreateEventModal from "./CreateEventModal";
import EnterTeamModal from "./EnterTeamModal";
import NotificationModal, { Notification } from "./NotificationModal";
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

interface TeamDetailViewProps {
  team: Team;
  users: Member[];
  events: Event[];
  files: File[];
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
    channelId: string
  ) => Promise<any>;
  onAddMember: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
  onUpdateMemberRole: (userId: string, role: string) => void;
  onUploadFile: (file: File) => void;
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
  const [teamFiles, setTeamFiles] = useState<File[]>(files);

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
      const response = await axios.get<File[]>(`/api/files/all/${team.id}`);
      setTeamFiles(response.data);
    } catch (error) {
      console.error("Error fetching team files:", error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleEnterTeamById = async (teamId: string) => {
    try {
      if (onEnterTeamById) {
        await onEnterTeamById(teamId);
        setShowEnterTeamModal(false);

        // Opțional: reîncarcă echipele sau actualizează starea
        // fetchTeams();
      }
    } catch (error) {
      // Gestionare erori suplimentară dacă este necesar
      console.error("Eroare la intrarea în echipă:", error);
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
  const upcomingEvents = events.filter(
    (event) => new Date(event.date) > new Date()
  ).length;

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

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm rounded-b-xl">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md">
              <span className="text-xl">{team.icon}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{team.name}</h1>
              <p className="text-sm text-gray-500">{team.description}</p>
              {showTeamId && team?.id && (
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-600 mr-2">
                    Team ID: {team.id}
                  </span>
                  <button
                    onClick={copyTeamId}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <FiCopy className="h-4 w-4 mr-1" />
                    Copy
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTeamId(!showTeamId)}
              className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 shadow-sm"
            >
              <FiCopy className="h-4 w-4 mr-2" />
              {showTeamId ? "Hide ID" : "Show ID"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotificationsModal(true)}
              className="relative flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 shadow-sm"
            >
              <FiBell className="h-4 w-4 mr-2" />
              Notifications
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-sm">
                  {unreadNotificationsCount}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 shadow-sm">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
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
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  selectedView === tab.id
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 shadow-sm"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {selectedView === ViewType.TEAM_DETAIL && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md">
                      <FiUsers className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Team Members
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
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
                  className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white shadow-md">
                      <FiMessageSquare className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Total Channels
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {totalChannels}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow-md">
                      <FiCalendar className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Upcoming Events
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {upcomingEvents}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-md">
                      <FiFile className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Total Files
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
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
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
              >
                <ChannelList
                  teamId={team.id}
                  channels={team.channels || []}
                  onJoinChannel={onJoinChannel}
                  onCreateChannel={() => onCreateChannel("")}
                  onSelectChannel={onSelectChannel}
                />
              </motion.div>
            )}

            {selectedView === ViewType.CHAT && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
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
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
                    Events
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openCreateEventModal}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:shadow-lg transition-all duration-200"
                  >
                    <FiPlus className="h-4 w-4 mr-2" />
                    Create Event
                  </motion.button>
                </div>
                <TeamCalendar
                  teamId={team.id}
                  members={users}
                  channels={team.channels || []}
                  onCreateEvent={openCreateEventModal}
                />
              </motion.div>
            )}

            {selectedView === ViewType.FILES && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
              >
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent">
                  Files
                </h2>
                <TeamFiles
                  teamId={team.id}
                  files={teamFiles}
                  channels={team.channels || []}
                  members={users}
                  onFileUpload={onFileUpload}
                  isLoading={isLoadingFiles}
                  onUploadFile={onUploadFile}
                  onDeleteFile={onDeleteFile}
                  onDownloadFile={(fileId) => {
                    // Implement download logic
                  }}
                  onShareFile={onShareFile}
                />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateEventModal && (
          <CreateEventModal
            teamId={team.id}
            userId={users[0]?.id || ""} // Assuming first user is current user
            channels={team.channels || []}
            onClose={() => setShowCreateEventModal(false)}
            onCreateEvent={handleCreateEvent}
          />
        )}
        {showEnterTeamModal && (
          <EnterTeamModal
            onClose={() => setShowEnterTeamModal(false)}
            onEnterTeam={handleEnterTeamById}
          />
        )}
        {showNotificationsModal && (
          <NotificationModal
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onJoinTeam={handleJoinTeam}
            onRejectTeamInvite={handleRejectTeamInvite}
            onClose={() => setShowNotificationsModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamDetailView;
