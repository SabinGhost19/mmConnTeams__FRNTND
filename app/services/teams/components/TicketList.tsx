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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        sourceId: teamId,
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Channel Tickets</h2>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center text-sm"
        >
          <FiPlus className="mr-2" />
          New Ticket
        </button>
      </div>

      {loading ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tickets...</p>
        </div>
      ) : error ? (
        <div className="p-6 text-center">
          <div className="text-red-500 mb-2">
            <FiAlertCircle className="h-10 w-10 mx-auto" />
          </div>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={fetchTickets}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-4">
            No tickets found for this channel
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
          >
            <FiPlus className="mr-2" />
            Create First Ticket
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="p-6 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg text-gray-900">
                    {ticket.title}
                  </h3>

                  {ticket.purpose && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Purpose:</span>{" "}
                      {ticket.purpose}
                    </p>
                  )}

                  {ticket.description && (
                    <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">
                      {ticket.description}
                    </p>
                  )}

                  <div className="mt-2 flex items-center text-sm">
                    <span className="font-medium text-gray-600 mr-1">
                      Created by:
                    </span>
                    <span className="text-blue-600">
                      {getSourceName(ticket.sourceId)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center text-sm">
                    <span className="font-medium text-gray-600 mr-1">
                      Assigned to:
                    </span>
                    <span className="text-blue-600">
                      {getDestinationName(ticket.destinationId)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center text-sm">
                    <FiClock className="text-gray-400 mr-1" />
                    <span
                      className={`${
                        isPastDeadline(ticket.deadline)
                          ? "text-red-600 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {formatDate(ticket.deadline)}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(ticket)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit ticket"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteTicket(ticket.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete ticket"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-400">
                Created: {formatDate(ticket.createdAt)}
                {ticket.updatedAt !== ticket.createdAt &&
                  ` · Updated: ${formatDate(ticket.updatedAt)}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">
                {isEditing ? "Edit Ticket" : "Create New Ticket"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
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
            >
              <div className="p-6">
                <div className="mb-4">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ticket title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="purpose"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Purpose
                  </label>
                  <input
                    type="text"
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Brief purpose of this ticket"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="destination"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Assign to
                  </label>
                  <select
                    id="destination"
                    value={destinationId}
                    onChange={(e) => setDestinationId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select team member</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="deadline"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Deadline
                  </label>
                  <input
                    type="date"
                    id="deadline"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
