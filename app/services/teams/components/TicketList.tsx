"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/auth-context";
import Ticket, { TicketDTO } from "@/app/types/models_types/ticket";
import {
  getTicketsByChannelId,
  getTicketsBySourceId,
  getTicketsByDestinationId,
  createTicket,
  updateTicket,
  deleteTicket,
} from "@/app/services/api/ticketService";
import { format } from "date-fns";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";
import { UserTeam } from "@/app/types/models_types/userType";

interface TicketListProps {
  channelId: string;
  teamId: string;
  teamMembers?: UserTeam[];
}

const TicketList: React.FC<TicketListProps> = ({
  channelId,
  teamId,
  teamMembers = [],
}) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "assignedToMe" | "createdByMe">(
    "all"
  );

  // modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<TicketDTO | null>(null);

  // form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [purpose, setPurpose] = useState("");
  const [deadline, setDeadline] = useState("");
  const [destinationId, setDestinationId] = useState<string>("");

  // fetch tickets when channel or user changes
  useEffect(() => {
    if (user?.id) {
      fetchTickets();
    }
  }, [channelId, user?.id]);

  // update filtered tickets when tickets or filter changes
  useEffect(() => {
    if (filter === "assignedToMe") {
      setFilteredTickets(
        tickets.filter((ticket) => ticket.destinationId === user?.id)
      );
    } else if (filter === "createdByMe") {
      setFilteredTickets(
        tickets.filter((ticket) => ticket.sourceId === user?.id)
      );
    } else {
      setFilteredTickets(tickets);
    }
  }, [tickets, filter, user?.id]);

  // fetch tickets from api
  const fetchTickets = async () => {
    try {
      setLoading(true);
      // Fetch tickets by channel
      const channelTickets = await getTicketsByChannelId(channelId);

      // Fetch tickets where user is source
      const sourceTickets = await getTicketsBySourceId();

      // Fetch tickets where user is destination
      const destinationTickets = await getTicketsByDestinationId();

      // Combine and remove duplicates
      const allTickets = [
        ...channelTickets,
        ...sourceTickets,
        ...destinationTickets,
      ];

      // Remove duplicates based on ticket ID
      const uniqueTickets = Array.from(
        new Map(allTickets.map((ticket) => [ticket.id, ticket])).values()
      );

      setTickets(uniqueTickets);
      setError(null);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  // handle create new ticket
  const handleCreateTicket = async () => {
    if (!user?.id) return;

    try {
      const newTicket: TicketDTO = {
        userId: user.id,
        channelId: channelId,
        sourceId: user.id, // Set sourceId to user.id for tickets created by the user
        title: title,
        description: description,
        purpose: purpose,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        destinationId: destinationId || user.id,
      };

      const createdTicket = await createTicket(newTicket);
      setTickets([...tickets, createdTicket]);
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error creating ticket:", err);
      setError("Failed to create ticket");
    }
  };

  // handle update ticket
  const handleUpdateTicket = async () => {
    if (!currentTicket?.id) return;

    try {
      const updatedTicketData: TicketDTO = {
        ...currentTicket,
        title: title,
        description: description,
        purpose: purpose,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        destinationId: destinationId || currentTicket.destinationId,
      };

      const updatedTicket = await updateTicket(
        currentTicket.id,
        updatedTicketData
      );

      setTickets(
        tickets.map((ticket) =>
          ticket.id === updatedTicket.id ? updatedTicket : ticket
        )
      );

      resetForm();
      setIsModalOpen(false);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating ticket:", err);
      setError("Failed to update ticket");
    }
  };

  // handle delete ticket
  const handleDeleteTicket = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;

    try {
      await deleteTicket(id);
      setTickets(tickets.filter((ticket) => ticket.id !== id));
    } catch (err) {
      console.error("Error deleting ticket:", err);
      setError("Failed to delete ticket");
    }
  };

  // open edit modal
  const openEditModal = (ticket: Ticket) => {
    if (ticket.sourceId !== user?.id) return; // Only allow editing if user is the creator

    setCurrentTicket({
      id: ticket.id,
      userId: ticket.userId,
      channelId: ticket.channelId,
      sourceId: ticket.sourceId,
      title: ticket.title,
      description: ticket.description || "",
      purpose: ticket.purpose || "",
      deadline: ticket.deadline,
      destinationId: ticket.destinationId,
    });

    setTitle(ticket.title);
    setDescription(ticket.description || "");
    setPurpose(ticket.purpose || "");
    setDeadline(ticket.deadline ? ticket.deadline.split("T")[0] : "");
    setDestinationId(ticket.destinationId || "");

    setIsEditing(true);
    setIsModalOpen(true);
  };

  // open create modal
  const openCreateModal = () => {
    resetForm();
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // reset form
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPurpose("");
    setDeadline("");
    setDestinationId("");
    setCurrentTicket(null);
  };

  // check if deadline is past
  const isPastDeadline = (deadlineStr?: string) => {
    if (!deadlineStr) return false;
    const deadline = new Date(deadlineStr);
    return deadline < new Date();
  };

  // format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "No deadline";
    return format(new Date(dateStr), "MMM d, yyyy");
  };

  // Helper function to get assignee name
  const getDestinationName = (destinationId?: string) => {
    if (!destinationId) return "Unassigned";

    const assignee = teamMembers.find((member) => member.id === destinationId);
    if (!assignee) return "Unknown User";

    return `${assignee.firstName} ${assignee.lastName}`;
  };

  // Helper function to get source name
  const getSourceName = (sourceId?: string) => {
    if (!sourceId) return "Unknown Source";

    const source = teamMembers.find((member) => member.id === sourceId);
    if (!source) return "Unknown Source";

    return `${source.firstName} ${source.lastName}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 w-full min-w-0">
      <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 flex flex-wrap justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">
          Channel Tickets
        </h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setFilter("all")}
            className={`py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-all duration-200 flex-grow sm:flex-grow-0 ${
              filter === "all"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Tickets
          </button>
          <button
            onClick={() => setFilter("assignedToMe")}
            className={`py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-all duration-200 flex-grow sm:flex-grow-0 ${
              filter === "assignedToMe"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Assigned to Me
          </button>
          <button
            onClick={() => setFilter("createdByMe")}
            className={`py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-all duration-200 flex-grow sm:flex-grow-0 ${
              filter === "createdByMe"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Created by Me
          </button>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 sm:px-4 rounded-md flex items-center justify-center text-sm font-medium shadow-md transition-all duration-200 flex-grow sm:flex-grow-0"
          >
            <FiPlus className="mr-2" />
            New Ticket
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading tickets...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <div className="text-red-500 mb-3">
            <FiAlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-700 font-medium">{error}</p>
          <button
            onClick={fetchTickets}
            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-md transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-600 mb-4 font-medium">
            {filter === "assignedToMe"
              ? "No tickets assigned to you"
              : filter === "createdByMe"
              ? "No tickets created by you"
              : "No tickets found for this channel"}
          </p>
          <button
            onClick={openCreateModal}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-md transition-all duration-200 inline-flex items-center"
          >
            <FiPlus className="mr-2" />
            Create Ticket
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-5 sm:p-6 hover:bg-blue-50/50 transition-colors duration-200 group"
            >
              <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-5">
                {/* Main content */}
                <div className="flex-1 min-w-0 w-full">
                  {/* Title with possible deadline indicator */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 break-words leading-tight">
                      {ticket.title}
                    </h3>
                    {ticket.deadline && (
                      <div
                        className={`flex items-center text-xs font-medium rounded-full px-2.5 py-1 ml-2 ${
                          isPastDeadline(ticket.deadline)
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        <FiClock className="mr-1.5 flex-shrink-0" size={12} />
                        {formatDate(ticket.deadline)}
                      </div>
                    )}
                  </div>

                  {/* Purpose - styled as a highlight */}
                  {ticket.purpose && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 font-medium">
                        {ticket.purpose}
                      </p>
                    </div>
                  )}

                  {/* Description - only shown if exists */}
                  {ticket.description && (
                    <div className="mb-4 bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                      <p className="text-sm text-gray-600 whitespace-pre-line break-words">
                        {ticket.description}
                      </p>
                    </div>
                  )}

                  {/* Meta information */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <div className="flex items-center text-xs bg-gray-50 px-3 py-1.5 rounded-full overflow-hidden border border-gray-100">
                      <span className="font-medium text-gray-700 mr-1.5">
                        Created by:
                      </span>
                      <span className="text-blue-600 font-medium truncate">
                        {getSourceName(ticket.sourceId)}
                      </span>
                    </div>

                    <div className="flex items-center text-xs bg-gray-50 px-3 py-1.5 rounded-full overflow-hidden border border-gray-100">
                      <span className="font-medium text-gray-700 mr-1.5">
                        Assigned to:
                      </span>
                      <span className="text-blue-600 font-medium truncate">
                        {getDestinationName(ticket.destinationId)}
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-gray-500 italic ml-1">
                      Created: {formatDate(ticket.createdAt)}
                      {ticket.updatedAt !== ticket.createdAt &&
                        ` · Updated: ${formatDate(ticket.updatedAt)}`}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 flex-shrink-0">
                  {/* Only show edit/delete if user is NOT the destination OR if user IS the source */}
                  {ticket.destinationId !== user?.id ||
                  ticket.sourceId === user?.id ? (
                    <>
                      <button
                        onClick={() => openEditModal(ticket)}
                        className={`p-2 rounded-lg ${
                          ticket.sourceId === user?.id
                            ? "text-blue-600 hover:bg-blue-100 hover:shadow-sm transition-all duration-200"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                        title={
                          ticket.sourceId === user?.id
                            ? "Edit ticket"
                            : "Cannot edit tickets you did not create"
                        }
                        disabled={ticket.sourceId !== user?.id}
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg hover:shadow-sm transition-all duration-200"
                        title="Delete ticket"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </>
                  ) : (
                    <div className="p-2 bg-blue-50 text-gray-600 italic text-xs text-center rounded-lg border border-blue-100">
                      Assigned to you
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Modal - updated styling */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl transform transition-all mx-auto border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
              <h2 className="text-lg font-bold text-gray-800">
                {isEditing ? "Edit Ticket" : "Create New Ticket"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-all duration-200"
                aria-label="Close"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                isEditing ? handleUpdateTicket() : handleCreateTicket();
              }}
              className="overflow-y-auto max-h-[calc(100vh-150px)]"
            >
              <div className="p-6">
                <div className="mb-5">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ticket title"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="purpose"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Purpose
                  </label>
                  <input
                    type="text"
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Brief purpose of this ticket"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description"
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="destination"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Assign to
                    </label>
                    <select
                      id="destination"
                      value={destinationId}
                      onChange={(e) => setDestinationId(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select team member</option>
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.firstName} {member.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="deadline"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Deadline
                    </label>
                    <input
                      type="date"
                      id="deadline"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap justify-end gap-3 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 w-full sm:w-auto mb-2 sm:mb-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 w-full sm:w-auto"
                >
                  {isEditing ? "Update Ticket" : "Create Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;
