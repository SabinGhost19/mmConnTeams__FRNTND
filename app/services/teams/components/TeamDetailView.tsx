"use client";
import React, { useState, useEffect } from "react";
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

interface NewEvent {
  title: string;
  description: string;
  date: string;
  duration: number;
  channelId: number;
  attendees: number[];
  teamId: string;
}

// Tipuri de vizualizare posibile
type ViewType = "overview" | "channels" | "members" | "events" | "files";

interface TeamDetailViewProps {
  team: Team;
  users: Member[];
  events: Event[];
  files: File[];
  selectedView: string;
  onChangeView: (view: ViewType) => void;
  onStartChat: (userId: string) => void;
  onJoinChannel: (teamId: string, channelId: string) => void;
  onCreateChannel: () => void;
  onInviteUser: () => void;
  onSelectChannel?: (channelId: string) => void;
  onCreateEvent?: (event: NewEvent) => void;
  onEnterTeamById?: (teamId: string) => void;
  onFetchNotifications?: () => Promise<Notification[]>;
  onMarkNotificationAsRead?: (notificationId: string) => Promise<void>;
  onJoinTeam?: (teamId: string, notificationId: string) => Promise<void>;
  onRejectTeamInvite?: (
    teamId: string,
    notificationId: string
  ) => Promise<void>;
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
  onCreateEvent,
  onEnterTeamById,
  onFetchNotifications,
  onMarkNotificationAsRead,
  onJoinTeam,
  onRejectTeamInvite,
}) => {
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
    navigator.clipboard.writeText(team.id.toString());
    // Feedback vizual pentru utilizator
    alert("ID-ul echipei a fost copiat în clipboard!");
  };

  // Funcție pentru a deschide modalul de intrare în echipă

  // Debugging console.log pentru a verifica starea modalului
  console.log("Modal state:", showCreateEventModal);

  const teamMembers = Array.isArray(users)
    ? users.filter((user) => team.members.includes(user.id))
    : [];

  const onlineMembers = Array.isArray(teamMembers)
    ? teamMembers.filter((user) => user.status === "online")
    : [];

  const totalChannels = team.channels.length;
  const totalFiles = files.length;
  const upcomingEvents = events.filter(
    (event) => new Date(event.date) > new Date()
  ).length;

  // Sortează canalele după numărul de mesaje necitite
  const sortedChannels = [...team.channels].sort(
    (a, b) => b.unreadCount - a.unreadCount
  );

  // Handler pentru crearea unui eveniment nou
  const handleCreateEvent = (newEvent: NewEvent) => {
    if (onCreateEvent) {
      onCreateEvent({
        ...newEvent,
        teamId: team.id,
      });
    }
    setShowCreateEventModal(false);
  };

  // Funcție pentru a deschide modalul
  const openCreateEventModal = () => {
    setShowCreateEventModal(true);
    console.log("Opening modal");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-4xl mr-4">{team.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{team.name}</h1>
              <p className="text-gray-600">{team.description}</p>
              <div className="flex items-center mt-1">
                <button
                  onClick={() => setShowTeamId(!showTeamId)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {showTeamId ? "Ascunde ID echipă" : "Arată ID echipă"}
                </button>
                {showTeamId && (
                  <div className="flex items-center ml-2">
                    <span className="text-gray-600 text-sm mr-2">
                      ID echipă: {team.id}
                    </span>
                    <button
                      onClick={copyTeamId}
                      className="p-1 bg-gray-100 hover:bg-gray-200 rounded"
                      title="Copiază ID-ul"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Buton pentru a intra într-o echipă folosind ID-ul */}
            <button
              onClick={() => setShowEnterTeamModal(true)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md flex items-center"
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
                  d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Intră în echipă după ID
            </button>

            <button
              onClick={onCreateChannel}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
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
              Canal nou
            </button>

            <button
              onClick={onInviteUser}
              className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 py-2 px-4 rounded-md flex items-center"
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Invită membri
            </button>

            {/* Buton pentru crearea unui eveniment nou */}
            <button
              onClick={openCreateEventModal}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md flex items-center"
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Eveniment nou
            </button>
          </div>
        </div>
      </div>

      {/* Restul codului rămâne neschimbat */}
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 flex justify-between">
        <div className="flex">
          <button
            onClick={() => onChangeView("overview" as ViewType)}
            className={`py-4 px-4 text-sm font-medium ${
              selectedView === "overview"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Prezentare generală
          </button>

          <button
            onClick={() => onChangeView("channels" as ViewType)}
            className={`py-4 px-4 text-sm font-medium ${
              selectedView === "channels"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Canale
          </button>

          <button
            onClick={() => onChangeView("members" as ViewType)}
            className={`py-4 px-4 text-sm font-medium ${
              selectedView === "members"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Membri
          </button>

          <button
            onClick={() => onChangeView("events" as ViewType)}
            className={`py-4 px-4 text-sm font-medium ${
              selectedView === "events"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Evenimente
          </button>

          <button
            onClick={() => onChangeView("files" as ViewType)}
            className={`py-4 px-4 text-sm font-medium ${
              selectedView === "files"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Fișiere
          </button>
        </div>

        {/* Buton pentru notificări */}
        <div className="flex items-center">
          <button
            onClick={() => {
              setShowNotificationsModal(true);
              fetchNotifications();
            }}
            className="py-2 px-2 relative text-gray-600 hover:text-gray-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            {unreadNotificationsCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {selectedView === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow p-5">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Membri</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {teamMembers.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-5">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Online</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {onlineMembers.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-5">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Canale</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalChannels}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-5">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
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
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Evenimente</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {upcomingEvents}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-5">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
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
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Fișiere</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalFiles}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Channels */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  Canale recente
                </h2>
                <button
                  onClick={() => onChangeView("channels" as ViewType)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Vezi toate
                </button>
              </div>

              <div className="space-y-3">
                {sortedChannels.slice(0, 5).map((channel) => (
                  <div
                    key={channel.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md cursor-pointer"
                    onClick={() => onJoinChannel(team.id, channel.id)}
                  >
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-3">#</span>
                      <span className="font-medium text-gray-900">
                        {channel.name}
                      </span>
                    </div>
                    {channel.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {channel.unreadCount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Members */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  Membri activi
                </h2>
                <button
                  onClick={() => onChangeView("members" as ViewType)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Vezi toți
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {onlineMembers.slice(0, 6).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-md cursor-pointer"
                    onClick={() => onStartChat(member.id)}
                  >
                    <div className="relative">
                      <img
                        src={
                          member.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            member.name
                          )}&background=0D8ABC&color=fff`
                        }
                        alt={member.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400"></span>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events Preview */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  Evenimente planificate
                </h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={openCreateEventModal}
                    className="text-sm text-yellow-600 hover:text-yellow-800 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
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
                    Adaugă
                  </button>
                  <button
                    onClick={() => onChangeView("events" as ViewType)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Vezi calendar
                  </button>
                </div>
              </div>

              {events.filter((event) => new Date(event.date) > new Date())
                .length === 0 ? (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-400 mx-auto mb-4"
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
                  <p className="text-gray-600 mb-2">
                    Niciun eveniment planificat
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    Programează un nou eveniment pentru a începe.
                  </p>
                  <button
                    onClick={openCreateEventModal}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
                  >
                    Adaugă primul eveniment
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {events
                    .filter((event) => new Date(event.date) > new Date())
                    .sort(
                      (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                    )
                    .slice(0, 3)
                    .map((event) => {
                      const eventDate = new Date(event.date);
                      const formattedDate = eventDate.toLocaleDateString(
                        "ro-RO",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      );
                      const formattedTime = eventDate.toLocaleTimeString(
                        "ro-RO",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      );

                      return (
                        <div
                          key={event.id}
                          className="flex border-l-4 border-blue-500 pl-4 py-2"
                        >
                          <div className="mr-4 text-center">
                            <p className="text-sm font-bold text-gray-900">
                              {eventDate.getDate()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {eventDate.toLocaleDateString("ro-RO", {
                                month: "short",
                              })}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {event.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-1">
                              {event.description}
                            </p>
                            <p className="text-xs text-gray-600">
                              {formattedTime} • {event.duration} minute •{" "}
                              {event.attendees.length} participanți
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Channels View */}
        {selectedView === "channels" && (
          <ChannelList
            teamId={team.id}
            channels={team.channels}
            onJoinChannel={onJoinChannel}
            onCreateChannel={onCreateChannel}
          />
        )}

        {/* Members View */}
        {selectedView === "members" && (
          <MembersList
            teamId={team.id}
            members={teamMembers}
            onStartChat={onStartChat}
            onInviteUser={onInviteUser}
          />
        )}

        {/* Events View */}
        {selectedView === "events" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Calendar evenimente
              </h2>
              <button
                onClick={openCreateEventModal}
                className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md flex items-center"
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
                Adaugă eveniment nou
              </button>
            </div>
            <TeamCalendar
              teamId={team.id}
              events={events}
              members={teamMembers}
              channels={team.channels}
              onCreateEvent={openCreateEventModal}
            />
          </div>
        )}

        {/* Files View */}
        {selectedView === "files" && (
          <TeamFiles
            teamId={team.id}
            files={files}
            channels={team.channels}
            members={teamMembers}
          />
        )}
      </div>

      {/* Modal pentru crearea unui eveniment */}
      {showCreateEventModal && (
        <div className="z-50">
          <CreateEventModal
            teamId={team.id}
            channels={team.channels}
            onClose={() => setShowCreateEventModal(false)}
            onCreateEvent={handleCreateEvent}
          />
        </div>
      )}

      {/* Modal pentru intrarea într-o echipă */}
      {showEnterTeamModal && (
        <EnterTeamModal
          onClose={() => setShowEnterTeamModal(false)}
          onEnterTeam={handleEnterTeamById}
        />
      )}

      {/* Modal pentru notificări */}
      {showNotificationsModal && (
        <NotificationModal
          notifications={notifications}
          onClose={() => setShowNotificationsModal(false)}
          onMarkAsRead={handleMarkAsRead}
          onJoinTeam={handleJoinTeam}
          onRejectTeamInvite={handleRejectTeamInvite}
        />
      )}
    </div>
  );
};

export default TeamDetailView;
