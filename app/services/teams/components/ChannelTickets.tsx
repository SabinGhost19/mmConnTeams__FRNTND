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
    <div className="mt-6">
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FiList className="mr-2" />
            Channel Tickets
          </h3>
          <button
            onClick={() => setShowTickets(!showTickets)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            {showTickets ? "Hide Tickets" : "Show Tickets"}
          </button>
        </div>

        {showTickets && (
          <div className="mt-2">
            <TicketList
              channelId={channelId}
              teamId={teamId}
              teamMembers={teamMembers}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelTickets;
