"use client";

import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import ProtectedRoute from "../components/ProtectedRoutes";
import RoleExclusionGuard from "../components/RoleExclusionGuard";
import { ROLE } from "../types/models_types/roles";
import Channel from "@/app/types/models_types/channel";
import { UserTeam } from "../types/models_types/userType";

// Updated Event type to match the TeamCalendar component
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

// Calendar components
interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isPast: boolean;
}

type ViewMode = "day" | "week" | "month";

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [members, setMembers] = useState<UserTeam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events and necessary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch events from API
        const eventsResponse = await api.get("/api/events-getall");
        setEvents(eventsResponse.data || []);

        // Fetch channels
        const channelsResponse = await api.get("/api/channels");
        setChannels(channelsResponse.data || []);

        // Fetch users
        const usersResponse = await api.get("/api/users");
        setMembers(usersResponse.data || []);
      } catch (err: any) {
        console.error("Error fetching calendar data:", err);
        setError(
          err.response?.status === 500
            ? "Server error: The calendar service is currently unavailable"
            : err instanceof Error
            ? err.message
            : "An error occurred fetching calendar data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper functions
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days with additional info
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    const days: CalendarDay[] = [];

    // Previous month days
    const daysInPrevMonth = getDaysInMonth(year, month - 1);
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      date.setHours(0, 0, 0, 0);
      days.push({
        date,
        isCurrentMonth: false,
        isPast: date < today,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      date.setHours(0, 0, 0, 0);
      days.push({
        date,
        isCurrentMonth: true,
        isPast: date < today,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      date.setHours(0, 0, 0, 0);
      days.push({
        date,
        isCurrentMonth: false,
        isPast: date < today,
      });
    }

    return days;
  };

  // Filter events for a specific date
  const getEventsForDate = (date: Date): Event[] => {
    return events.filter((event) => {
      const eventDate = new Date(event.eventDate);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  // Navigation functions
  const goToPreviousMonth = (): void => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = (): void => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = (): void => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const handleDateClick = (day: CalendarDay): void => {
    if (!day.isPast) {
      setSelectedDate(day.date);
      if (viewMode === "day") {
        setCurrentDate(day.date);
      }
    }
  };

  // Formatting functions
  const formatMonth = (date: Date): string => {
    return date.toLocaleDateString("ro-RO", { month: "long", year: "numeric" });
  };

  // Generate calendar data
  const calendarDays = generateCalendarDays();
  const weekdays = ["Du", "Lu", "Ma", "Mi", "Jo", "Vi", "Sâ"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <ProtectedRoute>
      <RoleExclusionGuard
        excludedRoles={[ROLE.ADMIN]}
        redirectTo="/admin"
        allowIfHasRole={[ROLE.STUDENT]}
      >
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold mb-6">Calendar</h1>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Calendar Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Calendar
                </h2>
                <span className="ml-2 px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-md">
                  {formatMonth(currentDate)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 rounded-md p-1">
                  <button
                    onClick={() => setViewMode("day")}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === "day"
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Zi
                  </button>
                  <button
                    onClick={() => setViewMode("week")}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === "week"
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Săptămână
                  </button>
                  <button
                    onClick={() => setViewMode("month")}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === "month"
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Lună
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    aria-label="Luna precedentă"
                  >
                    <ChevronLeftIcon />
                  </button>
                  <button
                    onClick={goToToday}
                    className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Astăzi
                  </button>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    aria-label="Luna următoare"
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {loading ? (
                <div className="text-center py-10">
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
                  <p className="text-gray-600">Se încarcă calendarul...</p>
                </div>
              ) : error ? (
                <div className="text-center py-10 text-red-500">
                  <p>{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Reîncearcă
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-px bg-gray-200">
                  {/* Weekday headers */}
                  {weekdays.map((weekday) => (
                    <div
                      key={weekday}
                      className="bg-gray-100 py-2 text-center text-sm font-medium text-gray-700"
                    >
                      {weekday}
                    </div>
                  ))}

                  {/* Calendar days */}
                  {calendarDays.map((day, index) => {
                    const dayEvents = getEventsForDate(day.date);
                    const isToday =
                      day.date.toDateString() === today.toDateString();
                    const isSelected =
                      selectedDate &&
                      day.date.toDateString() === selectedDate.toDateString();

                    return (
                      <div
                        key={index}
                        onClick={() => handleDateClick(day)}
                        className={`min-h-[120px] bg-white p-1.5 flex flex-col ${
                          day.isCurrentMonth ? "" : "text-gray-400"
                        } ${
                          isSelected
                            ? "ring-2 ring-blue-500 z-10"
                            : isToday
                            ? "ring-1 ring-blue-300"
                            : ""
                        } ${
                          day.isPast
                            ? "opacity-70 cursor-not-allowed"
                            : "cursor-pointer hover:bg-gray-50"
                        } transition-colors`}
                      >
                        <div
                          className={`text-right p-1 text-sm ${
                            isToday ? "font-bold text-blue-600" : "font-medium"
                          }`}
                        >
                          {day.date.getDate()}
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-1">
                          {dayEvents.slice(0, 3).map((event) => (
                            <EventBadge
                              key={event.id}
                              event={event}
                              channels={channels}
                              onSelectEvent={() => setSelectedDate(day.date)}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayEvents.length - 3} mai multe
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Date Events Panel */}
            {selectedDate && !loading && !error && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">
                    Evenimente pentru {selectedDate.toLocaleDateString("ro-RO")}
                  </h3>
                </div>

                {getEventsForDate(selectedDate).length > 0 ? (
                  <div className="space-y-3">
                    {getEventsForDate(selectedDate)
                      .sort(
                        (a, b) =>
                          new Date(a.eventDate).getTime() -
                          new Date(b.eventDate).getTime()
                      )
                      .map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          channels={channels}
                          members={members}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p className="mb-2">Nu există evenimente în această zi</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </RoleExclusionGuard>
    </ProtectedRoute>
  );
};

// Helper Components
const ChevronLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const EventBadge: React.FC<{
  event: Event;
  channels: Channel[];
  onSelectEvent: (event: Event) => void;
}> = ({ event, channels = [], onSelectEvent }) => {
  const eventDate = new Date(event.eventDate);
  const channel = channels.find((c) => c.id === event.channelId);

  const formattedTime = eventDate.toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      onClick={() => onSelectEvent(event)}
      className="text-xs p-1 bg-blue-50 text-blue-800 rounded truncate cursor-pointer hover:bg-blue-100 transition-colors"
    >
      <div className="font-medium truncate">{event.title}</div>
      <div className="flex justify-between items-center">
        <span className="text-blue-600">{formattedTime}</span>
        {channel && <span className="text-blue-500">#{channel.name}</span>}
      </div>
    </div>
  );
};

const EventCard = ({
  event,
  channels,
  members,
}: {
  event: Event;
  channels: Channel[];
  members: UserTeam[];
}) => {
  const eventDate = new Date(event.eventDate);
  const channel = channels.find((c) => c.id === event.channelId);

  // Find attendees based on the event.attendees array
  const attendees = members.filter((member) =>
    event.attendees.some((attendee) => attendee.userId === member.id)
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <div className="mr-3 flex-shrink-0">
          <div className="w-12 h-12 bg-blue-50 text-blue-800 rounded-lg flex flex-col items-center justify-center border border-blue-100">
            <span className="text-xs font-semibold text-blue-500">
              {eventDate.getHours().toString().padStart(2, "0")}:
              {eventDate.getMinutes().toString().padStart(2, "0")}
            </span>
            <span className="text-xs text-blue-600">{event.duration} min</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900">{event.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">
            {event.description}
          </p>
          <div className="mt-2 flex items-center justify-between">
            {channel && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                #{channel.name}
              </span>
            )}
            {attendees.length > 0 && (
              <div className="flex -space-x-2">
                {attendees.slice(0, 3).map((attendee) => (
                  <div
                    key={attendee.id}
                    className="w-6 h-6 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center"
                    title={attendee.email}
                  >
                    {attendee.email
                      ? attendee.email.charAt(0).toUpperCase()
                      : "?"}
                  </div>
                ))}
                {attendees.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 text-xs flex items-center justify-center border-2 border-white">
                    +{attendees.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
