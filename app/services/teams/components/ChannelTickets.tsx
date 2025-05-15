"use client";

import React, { useState } from "react";
import TicketList from "./TicketList";
import { FiList } from "react-icons/fi";
import { UserTeam } from "@/app/types/models_types/userType";

interface ChannelTicketsProps {
  channelId: string;
  teamId: string;
  teamMembers: UserTeam[];
}

const ChannelTickets: React.FC<ChannelTicketsProps> = ({
  channelId,
  teamId,
  teamMembers,
}) => {
  const [showTickets, setShowTickets] = useState(false);

  return (
    <div className="mt-8 w-full max-w-full min-w-0">
      <div className="border-t border-gray-200 pt-6 w-full">
        <div className="flex flex-wrap justify-between items-center mb-6 px-0 sm:px-2">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center mb-3 sm:mb-0">
            <FiList className="mr-3 text-blue-500 flex-shrink-0" size={22} />
            <span className="break-words">Channel Tickets</span>
          </h3>
          <button
            onClick={() => setShowTickets(!showTickets)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 w-full sm:w-auto ${
              showTickets
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-blue-600 text-white shadow-md hover:bg-blue-700"
            }`}
          >
            {showTickets ? "Hide Tickets" : "Show Tickets"}
          </button>
        </div>

        {showTickets && (
          <div className="mt-6 animate-fadeIn w-full">
            <div className="overflow-hidden w-full">
              <TicketList
                channelId={channelId}
                teamId={teamId}
                teamMembers={teamMembers}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelTickets;
