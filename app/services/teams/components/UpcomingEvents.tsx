// components/TeamsLanding/UpcomingEvents.tsx
import React, { useState } from "react";
import Team from "@/app/types/models_types/team";
import Event from "@/app/types/models_types/event";
import { UserTeam as User } from "@/app/types/models_types/userType";

interface UpcomingEventsProps {
  events: Event[];
  teams: Team[];
  users: User[];
  onCreateEvent?: (event: Omit<Event, "id">) => void;
}

// Interfața pentru datele formularului de creare eveniment
interface EventFormData {
  teamId: number;
  channelId: number;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  attendees: number[];
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({
  events,
  teams,
  users,
  onCreateEvent,
}) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<EventFormData>({
    teamId: teams.length > 0 ? teams[0].id : 0,
    channelId:
      teams.length > 0 && teams[0].channels.length > 0
        ? teams[0].channels[0].id
        : 0,
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0], // Data curentă în format YYYY-MM-DD
    time: "12:00",
    duration: 30,
    attendees: [],
  });
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(
    teams.length > 0 ? teams[0] : null
  );

  // Handler pentru schimbarea echipei
  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamId = Number(e.target.value);
    const team = teams.find((t) => t.id === teamId) || null;
    setSelectedTeam(team);
    setFormData({
      ...formData,
      teamId,
      channelId: team && team.channels.length > 0 ? team.channels[0].id : 0,
    });
  };

  // Handler pentru schimbarea valorilor formularului
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "teamId" || name === "channelId" || name === "duration"
          ? Number(value)
          : value,
    });
  };

  // Handler pentru selecția participanților
  const handleAttendeeToggle = (userId: number) => {
    setFormData((prev) => {
      const isSelected = prev.attendees.includes(userId);
      return {
        ...prev,
        attendees: isSelected
          ? prev.attendees.filter((id) => id !== userId)
          : [...prev.attendees, userId],
      };
    });
  };

  // Handler pentru trimiterea formularului
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Combinăm data și ora într-un singur string ISO
    const dateTimeISO = `${formData.date}T${formData.time}:00`;

    if (onCreateEvent) {
      onCreateEvent({
        teamId: formData.teamId,
        channelId: formData.channelId,
        title: formData.title,
        description: formData.description,
        date: dateTimeISO,
        duration: formData.duration,
        attendees: formData.attendees,
      });
    }

    setShowCreateModal(false);

    // Resetăm formularul
    setFormData({
      teamId: teams.length > 0 ? teams[0].id : 0,
      channelId:
        teams.length > 0 && teams[0].channels.length > 0
          ? teams[0].channels[0].id
          : 0,
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "12:00",
      duration: 30,
      attendees: [],
    });
  };

  if (events.length === 0 && !onCreateEvent) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-bold text-gray-800">Evenimente apropiate</h2>
        {onCreateEvent && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
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
            Adaugă eveniment
          </button>
        )}
      </div>

      <div className="p-4">
        {events.length === 0 ? (
          <div className="text-center py-6">
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
            <p className="text-gray-600 mb-2">Niciun eveniment apropiat</p>
            <p className="text-gray-500 text-sm mb-4">
              Programează un nou eveniment pentru a începe.
            </p>
            {onCreateEvent && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Adaugă primul eveniment
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {events.map((event) => {
              const eventDate = new Date(event.date);
              const isToday =
                new Date().toDateString() === eventDate.toDateString();
              const isTomorrow =
                new Date(Date.now() + 86400000).toDateString() ===
                eventDate.toDateString();

              const team = teams.find((t) => t.id === event.teamId);

              const attendees = event.attendees
                .map((id) => users.find((u) => u.id === id))
                .filter((user): user is User => user !== undefined);

              const onlineAttendees = attendees.filter(
                (u) => u.status === "online"
              ).length;

              const dateDisplay = isToday
                ? "Astăzi"
                : isTomorrow
                ? "Mâine"
                : eventDate.toLocaleDateString("ro-RO", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  });

              return (
                <li key={event.id} className="py-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-xs font-medium text-gray-500">
                        {dateDisplay}
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {eventDate.toLocaleTimeString("ro-RO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">
                        {team ? team.name : "Echipă necunoscută"} •{" "}
                        {event.duration} min
                      </p>
                      <div className="flex items-center">
                        <div className="flex -space-x-1">
                          {attendees.slice(0, 3).map((user) => (
                            <img
                              key={user.id}
                              src={
                                user.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  user.name
                                )}&background=0D8ABC&color=fff`
                              }
                              alt={user.name}
                              className="w-6 h-6 rounded-full border border-white"
                              title={user.name}
                            />
                          ))}

                          {attendees.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-200 border border-white flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                +{attendees.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="ml-2 text-xs text-gray-500">
                          {onlineAttendees}/{attendees.length} online
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {events.length > 0 && (
          <div className="mt-4 text-center">
            <a
              href="/calendar"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center"
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Vezi calendarul complet
            </a>
          </div>
        )}
      </div>

      {/* Modal pentru crearea evenimentului */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">
                Programează un eveniment nou
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
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

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Titlu eveniment */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Titlu eveniment*
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Echipa */}
                <div>
                  <label
                    htmlFor="teamId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Echipă*
                  </label>
                  <select
                    id="teamId"
                    name="teamId"
                    value={formData.teamId}
                    onChange={handleTeamChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Canal */}
                <div>
                  <label
                    htmlFor="channelId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Canal*
                  </label>
                  <select
                    id="channelId"
                    name="channelId"
                    value={formData.channelId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {selectedTeam?.channels.map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        {channel.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Data și ora */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="date"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Data*
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="time"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Ora*
                    </label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Durata */}
                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Durata (minute)*
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="5"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Descriere */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Descriere
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                {/* Participanți */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Participanți
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center py-1">
                        <input
                          type="checkbox"
                          id={`user-${user.id}`}
                          checked={formData.attendees.includes(user.id)}
                          onChange={() => handleAttendeeToggle(user.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`user-${user.id}`}
                          className="ml-2 flex items-center"
                        >
                          <img
                            src={
                              user.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.name
                              )}&background=0D8ABC&color=fff`
                            }
                            alt={user.name}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          <span className="text-sm text-gray-700">
                            {user.name}
                          </span>
                          {user.status === "online" && (
                            <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-400"></span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Salvează eveniment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;
