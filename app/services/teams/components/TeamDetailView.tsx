// components/TeamsLanding/TeamDetailView.tsx
"use client";
import React, { useState } from "react";
import ChannelList from "./ChannelList";
import MembersList from "./MembersList";
import TeamCalendar from "./TeamCalendar";
import TeamFiles from "./TeamFiles";
import CreateEventModal from "./CreateEventModal";
import Channel from "@/app/types/models_types/channel";
import { UserTeam as Member } from "@/app/types/models_types/userType";
import Team from "@/app/types/models_types/team";
import Event from "@/app/types/models_types/event";
import File from "@/app/types/models_types/file";
// Definirea interfețelor pentru toate tipurile de date

interface NewEvent {
  title: string;
  description: string;
  date: string;
  duration: number;
  channelId: number;
  attendees: number[];
  teamId: number;
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
  onStartChat: (userId: number) => void;
  onJoinChannel: (teamId: number, channelId: number) => void;
  onCreateChannel: () => void;
  onInviteUser: () => void;
  onSelectChannel?: (channelId: number) => void;
  onCreateEvent?: (event: NewEvent) => void;
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
}) => {
  // State pentru modalul de creare eveniment
  const [showCreateEventModal, setShowCreateEventModal] =
    useState<boolean>(false);

  // Debugging console.log pentru a verifica starea modalului
  console.log("Modal state:", showCreateEventModal);

  // Calculează statistici pentru echipă
  const teamMembers = users.filter((user) => team.members.includes(user.id));
  const onlineMembers = teamMembers.filter((user) => user.status === "online");
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
            </div>
          </div>

          <div className="flex items-center space-x-2">
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

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 flex">
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

      {/* Modal pentru crearea unui eveniment - verificăm în mod explicit că onCreateEvent există */}
      {showCreateEventModal && (
        <div className="z-50">
          <CreateEventModal
            teamId={team.id}
            channels={team.channels}
            members={teamMembers}
            onClose={() => setShowCreateEventModal(false)}
            onCreateEvent={handleCreateEvent}
          />
        </div>
      )}
    </div>
  );
};

export default TeamDetailView;
