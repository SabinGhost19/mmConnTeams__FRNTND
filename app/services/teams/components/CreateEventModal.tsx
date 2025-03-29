"use client";
import React, { useState } from "react";
import { UserTeam as Member } from "@/app/types/models_types/userType";
import TeamMembersList from "./TeamMembersList"; // Importă noua componentă
import Channel from "@/app/types/models_types/channel";

interface NewEvent {
  title: string;
  description: string;
  date: string;
  duration: number;
  channelId: number;
  attendees: number[];
  teamId: string;
}

interface CreateEventModalProps {
  teamId: string;
  channels?: Channel[];
  onClose: () => void;
  onCreateEvent: (event: NewEvent) => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  teamId,
  channels = [],
  onClose,
  onCreateEvent,
}) => {
  const [selectedAttendees, setSelectedAttendees] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"members" | "schedule">("members");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get("title")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const channelId = Number(formData.get("channelId")) || 0;
    const date = formData.get("date")?.toString() || "";
    const time = formData.get("time")?.toString() || "12:00";
    const duration = Number(formData.get("duration")) || 30;

    if (!title || !date || !time || channelId <= 0) {
      console.error("Date invalide pentru eveniment");
      return;
    }

    const dateTimeISO = `${date}T${time}:00`;

    onCreateEvent({
      title,
      description,
      date: dateTimeISO,
      channelId,
      duration,
      attendees: selectedAttendees,
      teamId,
    });

    onClose();
  };

  // Handler pentru selectarea membrilor
  const handleSelectMember = (memberId: number, isSelected: boolean) => {
    setSelectedAttendees((prev) =>
      isSelected ? [...prev, memberId] : prev.filter((id) => id !== memberId)
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">
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

        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
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

          {/* Tab-uri pentru membri/programare */}
          <div>
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  type="button"
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "members"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("members")}
                >
                  Participanți ({selectedAttendees.length})
                </button>
                <button
                  type="button"
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "schedule"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("schedule")}
                >
                  Programare
                </button>
              </nav>
            </div>
          </div>

          {/* Conținut tab-uri */}
          {activeTab === "members" ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <TeamMembersList
                teamId={teamId}
                onMemberSelect={handleSelectMember}
                selectedMembers={selectedAttendees}
              />
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                Opțiuni de programare vor fi adăugate aici...
              </p>
            </div>
          )}

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
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              Salvează eveniment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
