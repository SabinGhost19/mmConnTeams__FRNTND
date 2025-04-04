"use client";
import React, { useState, useEffect } from "react";
import Team from "@/app/types/models_types/team";
import { UserTeam as User } from "@/app/types/models_types/userType";
import { api } from "@/app/lib/api";
// Updated Event type to match the backend model
interface EventAttendee {
  id: string;
  userId: string;
  eventId: string;
}

interface Event {
  id: string;
  teamId: string;
  channelId: string;
  title: string;
  description: string;
  attendees: EventAttendee[];
  eventDate: string;
  duration: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface EventFormData {
  teamId: string;
  channelId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  attendees: string[];
}

interface UpcomingEventsProps {
  teams: Team[];
  users: User[];
  onCreateEvent?: (
    event: Omit<Event, "id" | "createdAt" | "updatedAt" | "createdBy">
  ) => void;
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({
  teams,
  users,
  onCreateEvent,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Fetch events when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // This endpoint will retrieve events for the authenticated user
        const response = await api.get("/api/events");
        setEvents(response.data || []);
      } catch (err: any) {
        console.error("Error fetching events:", err);
        // Handle 500 server errors specifically
        setError(
          err.response?.status === 500
            ? "Server error: The events service is currently unavailable"
            : err instanceof Error
            ? err.message
            : "An error occurred fetching events"
        );
        // Initialize with empty array when there's an error
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Sort events by date (most recent first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  );

  // Filter out past events
  const upcomingEvents = sortedEvents.filter(
    (event) => new Date(event.eventDate) >= new Date()
  );

  // Funcție pentru a obține primul canal disponibil
  const getFirstAvailableChannel = (
    teams: Team[]
  ): { teamId: string; channelId: string } => {
    if (teams.length === 0) {
      return { teamId: "", channelId: "" };
    }

    const firstTeam = teams[0];
    const firstChannel =
      firstTeam.channels && firstTeam.channels.length > 0
        ? firstTeam.channels[0]
        : null;

    return {
      teamId: String(firstTeam.id),
      channelId: firstChannel ? String(firstChannel.id) : "",
    };
  };

  // Inițializare stare cu verificări suplimentare
  const [formData, setFormData] = useState<EventFormData>(() => {
    const { teamId, channelId } = getFirstAvailableChannel(teams);

    return {
      teamId,
      channelId,
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "12:00",
      duration: 30,
      attendees: [],
    };
  });

  // State pentru echipa selectată
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(
    teams.length > 0 ? teams[0] : null
  );

  // Effect pentru a actualiza starea când teams se schimbă
  useEffect(() => {
    if (teams.length > 0) {
      const { teamId, channelId } = getFirstAvailableChannel(teams);

      setFormData((prev) => ({
        ...prev,
        teamId,
        channelId,
      }));

      setSelectedTeam(teams[0]);
    }
  }, [teams]);

  // Handler pentru schimbarea echipei
  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamId = e.target.value;
    const team = teams.find((t) => String(t.id) === teamId) || null;

    setSelectedTeam(team);

    // Verificare explicită pentru canale
    const firstChannel =
      team?.channels && team.channels.length > 0 ? team.channels[0] : null;

    setFormData((prev) => ({
      ...prev,
      teamId,
      channelId: firstChannel ? String(firstChannel.id) : "",
    }));
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
      [name]: name === "duration" ? Number(value) : value,
    });
  };

  // Handler pentru selecția participanților
  const handleAttendeeToggle = (userId: string) => {
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Combinăm data și ora într-un singur string ISO
    const dateTimeISO = `${formData.date}T${formData.time}:00Z`;

    try {
      // Prepare data in format expected by the API
      const eventCreateDTO = {
        teamId: formData.teamId,
        channelId: formData.channelId,
        title: formData.title,
        description: formData.description,
        eventDate: dateTimeISO,
        duration: formData.duration,
      };

      const attendeesDTO = formData.attendees.map((userId) => ({
        userId,
      }));

      const eventWithAttendeesDTO = {
        event: eventCreateDTO,
        attendees: attendeesDTO,
      };

      // If onCreateEvent is provided, use it, otherwise post directly to API
      if (onCreateEvent) {
        onCreateEvent({
          teamId: formData.teamId,
          channelId: formData.channelId,
          title: formData.title,
          description: formData.description,
          eventDate: dateTimeISO,
          duration: formData.duration,
          attendees: formData.attendees.map((attendeeId) => ({
            id: "",
            userId: attendeeId,
            eventId: "",
          })),
        });
      } else {
        // Post to API directly using the correct endpoint and format
        const response = await api.post(
          "/api/events-add",
          eventWithAttendeesDTO
        );

        if (response.status !== 200) {
          throw new Error(`Error creating event: ${response.statusText}`);
        }

        // Refresh the events list
        const eventsResponse = await api.get("/api/events");
        setEvents(eventsResponse.data);
      }

      setShowCreateModal(false);

      // Resetăm formularul
      const { teamId, channelId } = getFirstAvailableChannel(teams);
      setFormData({
        teamId,
        channelId,
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        time: "12:00",
        duration: 30,
        attendees: [],
      });
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Nu s-a putut crea evenimentul. Vă rugăm să încercați din nou.");
    }
  };

  if (!onCreateEvent && upcomingEvents.length === 0 && !loading) {
    return null;
  }

  // Function to check if a date is today
  const isToday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Function to check if a date is tomorrow
  const isTomorrow = (dateString: string): boolean => {
    const date = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    );
  };

  // Helper function to get attendee users
  const getAttendeeUsers = (event: Event): User[] => {
    const userIds = event.attendees.map((attendee) => attendee.userId);
    return users.filter((user) => userIds.includes(String(user.id)));
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-bold text-gray-800">Evenimente apropiate</h2>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-6">
            <svg
              className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4"
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
            <p className="text-gray-600">Se încarcă evenimentele...</p>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Reîncearcă
            </button>
          </div>
        ) : upcomingEvents.length === 0 ? (
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
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Adaugă primul eveniment
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {upcomingEvents.map((event) => {
              const eventDate = new Date(event.eventDate);
              const isEventToday = isToday(event.eventDate);
              const isEventTomorrow = isTomorrow(event.eventDate);

              const team = teams.find((t) => String(t.id) === event.teamId);
              const attendeeUsers = getAttendeeUsers(event);
              const onlineAttendees = attendeeUsers.filter(
                (u) => u.status === "online"
              ).length;

              const dateDisplay = isEventToday
                ? "Astăzi"
                : isEventTomorrow
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
                          {attendeeUsers.slice(0, 3).map((user) => (
                            <div
                              key={user.id}
                              className="w-6 h-6 rounded-full border border-white bg-blue-100 flex items-center justify-center"
                              title={user.email}
                            >
                              {user.email
                                ? user.email.charAt(0).toUpperCase()
                                : "?"}
                            </div>
                          ))}

                          {attendeeUsers.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-200 border border-white flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                +{attendeeUsers.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="ml-2 text-xs text-gray-500">
                          {onlineAttendees}/{attendeeUsers.length} online
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {upcomingEvents.length > 0 && (
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
                      <option key={team.id} value={String(team.id)}>
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
                    {selectedTeam?.channels &&
                      selectedTeam.channels.map((channel) => (
                        <option key={channel.id} value={String(channel.id)}>
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
                          checked={formData.attendees.includes(String(user.id))}
                          onChange={() => handleAttendeeToggle(String(user.id))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`user-${user.id}`}
                          className="ml-2 flex items-center"
                        >
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                            {user.email
                              ? user.email.charAt(0).toUpperCase()
                              : "?"}
                          </div>
                          <span className="text-sm text-gray-700">
                            {user.email || "User"}
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
