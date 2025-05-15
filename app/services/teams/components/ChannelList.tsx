"use client";

import React, { useState } from "react";

interface Channel {
  id: string;
  name?: string; // optional name to prevent errors
  unreadCount?: number;
  [key: string]: any; // for other unknown properties
}

interface ChannelListProps {
  teamId: string;
  channels?: Channel[]; // optional channels array
  onJoinChannel: (teamId: string, channelId: string) => void;
  onCreateChannel: () => void;
  onSelectChannel: (channelId: string) => void;
}

const ChannelList: React.FC<ChannelListProps> = ({
  teamId,
  channels = [], // default empty array
  onJoinChannel,
  onCreateChannel,
  onSelectChannel,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("activity");

  // safe filtering by search text
  const filteredChannels = channels.filter((channel) => {
    // check if channel and name exist
    if (!channel || !channel.name) return false;

    try {
      return channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    } catch (e) {
      console.error("Error filtering channel:", channel, e);
      return false;
    }
  });

  // safe channel sorting
  const sortedChannels = [...filteredChannels].sort((a, b) => {
    // check objects exist for sorting
    if (!a || !b) return 0;

    if (sortBy === "name") {
      // check names exist
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    } else if (sortBy === "unread") {
      // check unreadCount exists
      const countA = a.unreadCount || 0;
      const countB = b.unreadCount || 0;
      return countB - countA;
    } else {
      // activity - default sort by unread count
      const countA = a.unreadCount || 0;
      const countB = b.unreadCount || 0;
      return countB - countA;
    }
  });

  // rest of component remains the same...
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 flex justify-between items-center">
        <h2 className="font-bold text-white text-lg">Canale</h2>
        <button
          onClick={onCreateChannel}
          className="bg-white text-blue-700 py-2 px-4 rounded-full flex items-center text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
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
      </div>

      {/* Căutare și sortare */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Caută canal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>

          <div className="flex items-center">
            <label className="mr-2 text-sm text-gray-600 flex items-center font-medium">
              Sortează:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-lg text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm cursor-pointer"
            >
              <option value="activity">Activitate</option>
              <option value="name">Nume</option>
              <option value="unread">Necitite</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de canale */}
      {sortedChannels.length > 0 ? (
        <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50">
          {sortedChannels.map((channel) => {
            // verify channel exists before rendering
            if (!channel || !channel.id) return null;

            return (
              <div
                key={channel.id}
                className="px-6 py-4 hover:bg-blue-50 cursor-pointer transition-colors duration-200 group"
                onClick={() => onJoinChannel(teamId, channel.id)}
              >
                <div className="flex items-start">
                  <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 p-3 mr-4 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-200">
                    <span className="text-indigo-600 font-medium text-lg">
                      #
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                        {channel.name || "Canal fără nume"}
                      </h3>
                      {(channel.unreadCount || 0) > 0 && (
                        <span className="ml-3 bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm">
                          {channel.unreadCount}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-200">
                      {(channel.unreadCount || 0) > 0
                        ? `${channel.unreadCount} mesaje necitite`
                        : "Niciun mesaj necitit"}
                    </p>
                  </div>

                  <button
                    className="text-gray-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-100 transition-colors duration-200"
                    title="Mai multe opțiuni"
                    onClick={(e) => {
                      e.stopPropagation();
                      // channel options menu would go here
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-5 animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-blue-500"
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
          <p className="text-gray-800 font-medium text-lg mb-2">
            Niciun canal găsit
          </p>
          <p className="text-gray-500 mb-6 max-w-xs mx-auto">
            {searchQuery
              ? "Încearcă un alt termen de căutare sau creează un canal nou."
              : "Începe prin a crea primul canal pentru echipa ta."}
          </p>
          <button
            onClick={onCreateChannel}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full hover:shadow-lg transition-all duration-300 inline-flex items-center font-medium transform hover:scale-105"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
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
            Crează canal nou
          </button>
        </div>
      )}
    </div>
  );
};

export default ChannelList;
