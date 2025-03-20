// components/TeamsLanding/TeamsOverview.tsx
import React from "react";
import UpcomingEvents from "./UpcomingEvents";
import ActiveUsers from "./ActiveUsers";
import Channel from "@/app/types/models_types/channel";
import { UserTeam as User } from "@/app/types/models_types/userType";
import Team from "@/app/types/models_types/team";
import Event from "@/app/types/models_types/event";
// Definirea interfețelor pentru toate tipurile de date

interface TeamsOverviewProps {
  teams: Team[];
  users: User[];
  events: Event[];
  onSelectTeam: (teamId: number) => void;
  onStartChat: (userId: number) => void;
  onJoinChannel: (teamId: number, channelId: number) => void;
  onCreateTeam: () => void;
}

const TeamsOverview: React.FC<TeamsOverviewProps> = ({
  teams,
  users,
  events,
  onSelectTeam,
  onStartChat,
  onJoinChannel,
  onCreateTeam,
}) => {
  // Extrage utilizatorii online
  const onlineUsers = users.filter((user) => user.status === "online");

  // Sortează eventurile după data (cele mai apropiate primele)
  const sortedEvents = [...events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5); // Doar primele 5

  // Calculează numărul total de canale
  const totalChannels = teams.reduce(
    (sum, team) => sum + team.channels.length,
    0
  );

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Prezentare generală Teams
          </h1>
          <button
            onClick={onCreateTeam}
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
            Echipă nouă
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50 p-6 overflow-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Echipe</p>
                <p className="text-2xl font-bold text-gray-800">
                  {teams.length}
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Utilizatori activi</p>
                <p className="text-2xl font-bold text-gray-800">
                  {onlineUsers.length}
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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Notificări noi</p>
                <p className="text-2xl font-bold text-gray-800">
                  {teams.reduce((sum, team) => sum + team.unreadCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Teams Grid and Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Teams Grid */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Echipele tale
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
                >
                  <div
                    className={`h-2 ${
                      team.unreadCount > 0 ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  ></div>
                  <div className="p-5">
                    <div className="flex items-center mb-4">
                      <span className="text-3xl mr-3">{team.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {team.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {team.channels.length} canale
                        </p>
                      </div>
                      {team.unreadCount > 0 && (
                        <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          {team.unreadCount}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {team.description}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex -space-x-2">
                        {team.members.slice(0, 3).map((memberId) => {
                          const user = users.find((u) => u.id === memberId);
                          return user ? (
                            <img
                              key={user.id}
                              src={
                                user.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  user.name
                                )}&background=0D8ABC&color=fff`
                              }
                              alt={user.name}
                              className="w-8 h-8 rounded-full border-2 border-white"
                            />
                          ) : null;
                        })}

                        {team.members.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              +{team.members.length - 3}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex">
                        <button
                          onClick={() => onSelectTeam(team.id)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm"
                        >
                          Vezi detalii
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Upcoming Events */}
            <UpcomingEvents events={sortedEvents} teams={teams} users={users} />

            {/* Active Users */}
            <ActiveUsers users={onlineUsers} onStartChat={onStartChat} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsOverview;
