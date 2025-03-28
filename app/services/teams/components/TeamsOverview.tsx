"use client";
import React, { useEffect, useState } from "react";
import UpcomingEvents from "./UpcomingEvents";
import ActiveUsers from "./ActiveUsers";
import Channel from "@/app/types/models_types/channel";
import { UserTeam as User } from "@/app/types/models_types/userType";
import Team from "@/app/types/models_types/team";
import Event from "@/app/types/models_types/event";
import { api as axios } from "@/app/lib/api";
import { toASCII } from "punycode";

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
  const [totalChannels, setTotalChannels] = useState(0);

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
        console.log("Total channels...", total);
        setTotalChannels(total);
      } catch (error) {
        console.error("Eroare la calcularea numărului total de canale:", error);
        setTotalChannels(0);
      }
    };

    loadTotalChannels();
  }, [teams]);

  const fetchTeamChannels = async (teamId: string): Promise<Channel[]> => {
    try {
      const response = await axios.get<Channel[]>(
        `/api/teams/${teamId}/channels`
      );
      console.log("ALL CHANNELS: ", response.data);
      return response.data || [];
    } catch (error) {
      console.error(
        `Eroare la preluarea canalelor pentru echipa ${teamId}:`,
        error
      );
      return [];
    }
  };

  const onlineUsers = users.filter((user) => user.status === "online");

  const sortedEvents = [...events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col h-full overflow-auto">
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

      <div className="flex-1 bg-gray-50 p-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Carduri statistici (rămân neschimbate) */}
          {/* ... */}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
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
                          {team.channels ? team.channels.length : 0} canale
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
                        {/* Modificare pentru a gestiona membrii */}
                        {Array.isArray(team.members) &&
                        team.members.length > 0 ? (
                          team.members.slice(0, 3).map((memberId) => {
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
                          })
                        ) : (
                          <span className="text-sm text-gray-500">
                            Niciun membru
                          </span>
                        )}

                        {Array.isArray(team.members) &&
                          team.members.length > 3 && (
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

          <div className="lg:w-80 space-y-6">
            <UpcomingEvents events={sortedEvents} teams={teams} users={users} />
            <ActiveUsers users={onlineUsers} onStartChat={onStartChat} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsOverview;
