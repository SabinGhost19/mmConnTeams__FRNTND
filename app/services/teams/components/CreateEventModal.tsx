"use client";
import React, { useState, useEffect } from "react";
import { UserTeam as Member } from "@/app/types/models_types/userType";
import TeamMembersList from "./TeamMembersList";
import Channel from "@/app/types/models_types/channel";
import {
  NewEvent,
  EventAttendee,
  NewEventWithAttendees,
  AttendeeStatus,
} from "@/app/types/models_types/eventTypes";
import { api as axios } from "@/app/lib/api";

interface CreateEventModalProps {
  teamId: string;
  userId: string; // Current user ID
  channels?: Channel[];
  onClose: () => void;
  onCreateEvent: (eventData: NewEventWithAttendees) => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  teamId,
  userId,
  channels = [],
  onClose,
  onCreateEvent,
}) => {
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"members" | "schedule">("members");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const title = formData.get("title")?.toString() || "";
      const description = formData.get("description")?.toString() || "";
      const channelId = formData.get("channelId")?.toString() || "";
      const date = formData.get("date")?.toString() || "";
      const time = formData.get("time")?.toString() || "12:00";
      const duration = Number(formData.get("duration")) || 30;

      if (!title || !date || !time || !channelId) {
        setError("Toate câmpurile obligatorii trebuie completate");
        return;
      }

      const eventDate = `${date}T${time}:00`;

      // Create the event object
      const newEvent: NewEvent = {
        teamId,
        channelId,
        title,
        description,
        eventDate,
        duration,
        createdBy: userId,
      };

      // Create attendees array
      const attendees: EventAttendee[] = selectedAttendees.map((userId) => ({
        userId,
        status: AttendeeStatus.PENDING,
      }));

      // Create the complete event object with attendees
      const eventWithAttendees: NewEventWithAttendees = {
        event: newEvent,
        attendees,
      };

      // Call the onCreateEvent function with the new event data
      onCreateEvent(eventWithAttendees);

      onClose();
    } catch (error) {
      console.error("Error creating event:", error);
      setError("A apărut o eroare la crearea evenimentului");
    } finally {
      setLoading(false);
    }
  };

  // Handler pentru selectarea membrilor
  const handleSelectMember = (memberId: string, isSelected: boolean) => {
    setSelectedAttendees((prev) =>
      isSelected ? [...prev, memberId] : prev.filter((id) => id !== memberId)
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-auto my-8 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-xl text-gray-800">
            Programează un eveniment nou
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Titlu eveniment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titlu eveniment*
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Canal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Canal*
                </label>
                <select
                  name="channelId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {channels.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descriere */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descriere
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Data și ora */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data*
                  </label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ora*
                  </label>
                  <input
                    type="time"
                    name="time"
                    defaultValue="12:00"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Durata */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durata (minute)*
                </label>
                <input
                  type="number"
                  name="duration"
                  defaultValue="30"
                  min="5"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 ${
                    loading
                      ? "bg-yellow-400"
                      : "bg-yellow-500 hover:bg-yellow-600"
                  } text-white rounded-md flex items-center`}
                >
                  {loading && (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  Salvează eveniment
                </button>
              </div>
            </form>
          </div>

          <div className="md:w-1/2 border-t md:border-t-0 md:border-l border-gray-200 p-6">
            <div className="mb-4">
              <h4 className="text-lg font-medium text-gray-800 mb-2">
                Participanți ({selectedAttendees.length})
              </h4>
              <p className="text-sm text-gray-500">
                Selectați membrii care vor participa la eveniment.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
              <TeamMembersList
                teamId={teamId}
                onMemberSelect={handleSelectMember}
                selectedMembers={selectedAttendees}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;
