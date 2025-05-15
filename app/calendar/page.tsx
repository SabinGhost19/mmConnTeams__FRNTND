"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/app/lib/api";
import ProtectedRoute from "../components/ProtectedRoutes";
import RoleExclusionGuard from "../components/RoleExclusionGuard";
import { ROLE } from "../types/models_types/roles";
import Channel from "@/app/types/models_types/channel";
import { UserTeam } from "../types/models_types/userType";

// Updated Event type to match the TeamCalendar component
interface EventAttendee {
  id: string; // UUID
  eventId: string; // UUID
  userId: string; // UUID
  status: string;
  createdAt: string; // ZonedDateTime
}

interface Event {
  id: string; // UUID
  teamId: string; // UUID
  channelId: string; // UUID
  title: string;
  description: string;
  eventDate: string; // ZonedDateTime
  duration: number;
  createdBy: string; // UUID
  createdAt: string; // ZonedDateTime
  updatedAt: string; // ZonedDateTime
  attendees: EventAttendee[];
}

// Calendar components
interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isPast: boolean;
}

type ViewMode = "day" | "week" | "month";

const CalendarPage = () => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [members, setMembers] = useState<UserTeam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [isCardFixed, setIsCardFixed] = useState<boolean>(false);

  // Fetch events and necessary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch events from API
        const eventsResponse = await api.get("/api/events-getall");
        setEvents(eventsResponse.data || []);
        console.log(
          "Events data loaded:",
          eventsResponse.data?.length > 0
            ? `Found ${eventsResponse.data.length} events`
            : "No events found"
        );

        // Fetch channels
        const channelsResponse = await api.get("/api/channels-getforuser");
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
      if (!event.eventDate) return false;
      try {
        const eventDate = new Date(event.eventDate);
        return (
          eventDate.getFullYear() === date.getFullYear() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getDate() === date.getDate()
        );
      } catch (err) {
        console.error("Invalid date format in event:", event);
        return false;
      }
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

  // Adaug funcții noi pentru gestionarea hover-ului mai robust
  const handleMouseEnter = (e: React.MouseEvent, event: Event) => {
    if (!isCardFixed) {
      setHoveredEvent(event);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setHoveredPosition({
        top: rect.top - 10, // Poziționez cardul deasupra evenimentului
        left: rect.left + rect.width / 2, // Centrat pe eveniment
      });
    }
  };

  const handleMouseLeave = () => {
    if (!isCardFixed) {
      setHoveredEvent(null);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Previne propagarea click-ului
    setIsCardFixed(!isCardFixed);
  };

  const closeFixedCard = () => {
    setIsCardFixed(false);
    setHoveredEvent(null);
  };

  return (
    <ProtectedRoute>
      <RoleExclusionGuard
        excludedRoles={[ROLE.ADMIN]}
        redirectTo="/admin"
        allowIfHasRole={[ROLE.STUDENT]}
      >
        <div className="relative min-h-screen">
          {/* Blurred background image */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
              alt="Calendar Background"
              fill
              style={{ objectFit: "cover" }}
              quality={80}
              className="opacity-10"
            />
          </div>

          <div className="container relative z-10 mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Calendar
              </h1>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-md transition-colors flex items-center shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Înapoi la Dashboard
              </button>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-gray-200">
              {/* Calendar Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Calendar
                  </h2>
                  <span className="ml-2 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md shadow-sm">
                    {formatMonth(currentDate)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex bg-white rounded-md p-1 shadow-sm">
                    <button
                      onClick={() => setViewMode("day")}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        viewMode === "day"
                          ? "bg-blue-100 text-blue-800 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Zi
                    </button>
                    <button
                      onClick={() => setViewMode("week")}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        viewMode === "week"
                          ? "bg-blue-100 text-blue-800 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Săptămână
                    </button>
                    <button
                      onClick={() => setViewMode("month")}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        viewMode === "month"
                          ? "bg-blue-100 text-blue-800 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Lună
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      aria-label="Luna precedentă"
                    >
                      <ChevronLeftIcon />
                    </button>
                    <button
                      onClick={goToToday}
                      className="px-3 py-1 text-sm bg-white text-blue-600 hover:bg-blue-50 rounded-md transition-colors shadow-sm"
                    >
                      Astăzi
                    </button>
                    <button
                      onClick={goToNextMonth}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      aria-label="Luna următoare"
                    >
                      <ChevronRightIcon />
                    </button>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-4 relative">
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
                  <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden shadow-inner">
                    {/* Weekday headers */}
                    {weekdays.map((weekday) => (
                      <div
                        key={weekday}
                        className="bg-gradient-to-b from-blue-50 to-white py-2 text-center text-sm font-medium text-gray-700"
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
                            day.isCurrentMonth ? "" : "text-gray-400 bg-gray-50"
                          } ${
                            isSelected
                              ? "ring-2 ring-blue-500 z-10"
                              : isToday
                              ? "ring-1 ring-blue-300 bg-blue-50/50"
                              : ""
                          } ${
                            day.isPast
                              ? "opacity-70 cursor-not-allowed"
                              : "cursor-pointer hover:bg-blue-50/30"
                          } transition-all`}
                        >
                          <div
                            className={`text-right p-1 text-sm ${
                              isToday
                                ? "font-bold text-blue-600"
                                : "font-medium"
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
                                onMouseEnter={(e) => handleMouseEnter(e, event)}
                                onMouseLeave={handleMouseLeave}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-xs text-gray-500 text-center font-medium bg-gray-100 rounded py-0.5">
                                +{dayEvents.length - 3} mai multe
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Hover Event Detail Card - Îmbunătățit */}
                {hoveredEvent && hoveredPosition && (
                  <div
                    onClick={handleCardClick}
                    className={`fixed z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden transition-all duration-200 ${
                      isCardFixed ? "opacity-100 scale-100" : "hover:scale-105"
                    }`}
                    style={{
                      top: `${hoveredPosition.top}px`,
                      left: `${hoveredPosition.left}px`,
                      transform: "translate(-50%, -100%)",
                    }}
                  >
                    {isCardFixed && (
                      <button
                        onClick={closeFixedCard}
                        className="absolute top-1 right-1 z-10 p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
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
                    )}
                    <EventDetailCard
                      event={hoveredEvent}
                      channels={channels}
                      members={members}
                      isDetailed={isCardFixed}
                    />
                  </div>
                )}
              </div>

              {/* Selected Date Events Panel */}
              {selectedDate && !loading && !error && (
                <div className="border-t border-gray-200 p-4 bg-gradient-to-b from-white to-blue-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Evenimente pentru{" "}
                      {selectedDate.toLocaleDateString("ro-RO")}
                    </h3>
                  </div>

                  {getEventsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-4">
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
                    <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-blue-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500">
                        Nu există evenimente în această zi
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
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
  onMouseEnter: (e: React.MouseEvent, event: Event) => void;
  onMouseLeave: () => void;
}> = ({ event, channels = [], onSelectEvent, onMouseEnter, onMouseLeave }) => {
  if (!event.eventDate) {
    return null;
  }

  try {
    const eventDate = new Date(event.eventDate);
    const channel = channels.find((c) => c.id === event.channelId);

    const formattedTime = eventDate.toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Calculăm un indicator pentru numărul de participanți
    const attendeesCount = event.attendees?.length || 0;

    return (
      <div
        onClick={() => onSelectEvent(event)}
        onMouseEnter={(e) => onMouseEnter(e, event)}
        onMouseLeave={onMouseLeave}
        className="text-xs p-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 rounded-md shadow-sm cursor-pointer hover:from-blue-100 hover:to-indigo-100 hover:shadow transition-all duration-200"
      >
        <div className="font-medium truncate">{event.title}</div>
        <div className="flex justify-between items-center">
          <span className="text-blue-600 font-semibold">{formattedTime}</span>
          <div className="flex items-center space-x-1">
            {attendeesCount > 0 && (
              <span className="bg-blue-100 text-blue-700 rounded-full px-1 text-[9px] flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-2.5 w-2.5 mr-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                {attendeesCount}
              </span>
            )}
            {channel ? (
              <span className="text-indigo-500 text-[10px]">
                #{channel.name}
              </span>
            ) : (
              <span className="text-green-600 text-[10px] font-medium">
                not assigned
              </span>
            )}
          </div>
        </div>
      </div>
    );
  } catch (err) {
    console.error("Error rendering event badge:", err);
    return null;
  }
};

const EventDetailCard: React.FC<{
  event: Event;
  channels: Channel[];
  members: UserTeam[];
  isDetailed: boolean;
}> = ({ event, channels, members, isDetailed }) => {
  if (!event.eventDate) {
    return null;
  }

  try {
    const eventDate = new Date(event.eventDate);
    const channel = channels.find((c) => c.id === event.channelId);

    // Find creator info
    const creator = members.find((member) => member.id === event.createdBy);

    // Calculate end time
    const endTime =
      event.duration !== undefined
        ? new Date(eventDate.getTime() + event.duration * 60000)
        : new Date(eventDate.getTime() + 60 * 60000); // Default to 1 hour if duration not specified

    // Find attendees
    const attendees = members.filter((member) =>
      event.attendees && Array.isArray(event.attendees)
        ? event.attendees.some((attendee) => attendee.userId === member.id)
        : false
    );

    // Format date strings for detailed view
    const createdAt = event.createdAt ? new Date(event.createdAt) : null;
    const updatedAt = event.updatedAt ? new Date(event.updatedAt) : null;

    // Group attendees by status if in detailed mode
    const attendeesByStatus = isDetailed
      ? event.attendees?.reduce((groups, attendee) => {
          const status = attendee.status || "PENDING";
          if (!groups[status]) groups[status] = [];
          groups[status].push(attendee);
          return groups;
        }, {} as Record<string, EventAttendee[]>)
      : {};

    return (
      <div className="relative overflow-hidden">
        <div
          className={`absolute top-0 right-0 left-0 ${
            isDetailed ? "h-8" : "h-6"
          } bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t`}
        />
        <div className={`${isDetailed ? "pt-8 p-4" : "pt-6 p-3"}`}>
          <h3
            className={`font-bold text-gray-900 mb-1 ${
              isDetailed ? "text-lg" : ""
            }`}
          >
            {event.title}
          </h3>

          <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1 text-xs mb-2">
            <span className="text-gray-500">Când:</span>
            <span className="text-gray-700 font-medium">
              {eventDate.toLocaleDateString("ro-RO")} •{" "}
              {eventDate.toLocaleTimeString("ro-RO", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {endTime.toLocaleTimeString("ro-RO", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            <span className="text-gray-500">Durată:</span>
            <span className="text-gray-700 font-medium">
              {event.duration !== undefined ? (
                `${event.duration} minute`
              ) : (
                <span className="text-green-600 font-medium">
                  not assigned in any team or channel yet
                </span>
              )}
            </span>

            {channel && (
              <>
                <span className="text-gray-500">Canal:</span>
                <span className="text-gray-700 font-medium">
                  #{channel.name}
                </span>
              </>
            )}

            {creator && (
              <>
                <span className="text-gray-500">Organizator:</span>
                <span className="text-gray-700 font-medium">
                  {creator.firstName} {creator.lastName}
                </span>
              </>
            )}

            <span className="text-gray-500">Participanți:</span>
            <span className="text-gray-700">{attendees.length} persoane</span>

            {isDetailed && createdAt && (
              <>
                <span className="text-gray-500">Creat la:</span>
                <span className="text-gray-700">
                  {createdAt.toLocaleDateString("ro-RO")}{" "}
                  {createdAt.toLocaleTimeString("ro-RO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </>
            )}

            {isDetailed && updatedAt && (
              <>
                <span className="text-gray-500">Actualizat la:</span>
                <span className="text-gray-700">
                  {updatedAt.toLocaleDateString("ro-RO")}{" "}
                  {updatedAt.toLocaleTimeString("ro-RO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </>
            )}

            {isDetailed && (
              <>
                <span className="text-gray-500">ID Eveniment:</span>
                <span className="text-gray-700 text-[9px]">{event.id}</span>
              </>
            )}
          </div>

          {event.description && (
            <div
              className={`text-xs text-gray-600 border-t border-gray-100 pt-1 mt-1 ${
                isDetailed ? "" : "line-clamp-2"
              }`}
            >
              <p>{event.description}</p>
            </div>
          )}

          {isDetailed && event.attendees && event.attendees.length > 0 && (
            <div className="mt-3 border-t border-gray-100 pt-2">
              <div className="text-xs font-medium text-gray-700 mb-2">
                Participanți:
              </div>
              <div className="space-y-2">
                {Object.entries(attendeesByStatus).map(
                  ([status, statusAttendees]) => (
                    <div key={status}>
                      <div className="text-[10px] font-medium text-gray-500 mb-1 uppercase">
                        {status === "ACCEPTED"
                          ? "Confirmat"
                          : status === "DECLINED"
                          ? "Respins"
                          : "În așteptare"}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {statusAttendees.map((attendee) => {
                          const member = members.find(
                            (m) => m.id === attendee.userId
                          );
                          return (
                            <div
                              key={attendee.id}
                              className={`text-[10px] px-2 py-1 rounded-full flex items-center ${
                                status === "ACCEPTED"
                                  ? "bg-green-50 text-green-700"
                                  : status === "DECLINED"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-gray-50 text-gray-700"
                              }`}
                              title={attendee.createdAt || ""}
                            >
                              <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center mr-1 shadow-sm">
                                {member?.firstName?.[0] ||
                                  member?.email?.[0] ||
                                  "?"}
                              </div>
                              <span>
                                {member
                                  ? member.firstName && member.lastName
                                    ? `${member.firstName} ${member.lastName}`
                                    : member.email
                                  : "Unknown"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (err) {
    console.error("Error rendering event detail card:", err);
    return null;
  }
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
  if (!event.eventDate) {
    return null;
  }

  try {
    const eventDate = new Date(event.eventDate);
    const channel = channels.find((c) => c.id === event.channelId);
    const creator = members.find((member) => member.id === event.createdBy);

    // Calculate end time with a fallback if duration is undefined
    const endTime =
      event.duration !== undefined
        ? new Date(eventDate.getTime() + event.duration * 60000)
        : new Date(eventDate.getTime() + 60 * 60000); // Default to 1 hour if duration not specified

    // Find attendees based on the event.attendees array
    const attendees = members.filter((member) =>
      event.attendees && Array.isArray(event.attendees)
        ? event.attendees.some((attendee) => attendee.userId === member.id)
        : false
    );

    // Group attendees by status
    const attendeesByStatus =
      event.attendees?.reduce((groups, attendee) => {
        const status = attendee.status || "PENDING";
        if (!groups[status]) groups[status] = [];
        groups[status].push(attendee);
        return groups;
      }, {} as Record<string, EventAttendee[]>) || {};

    // Calculez numărul de participanți confirmați
    const confirmedAttendees = attendeesByStatus["ACCEPTED"]?.length || 0;

    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
        <div className="p-4">
          <div className="flex items-start">
            <div className="mr-4 flex-shrink-0">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-800 rounded-lg flex flex-col items-center justify-center shadow-inner">
                <span className="text-sm font-bold text-blue-600">
                  {eventDate.getHours().toString().padStart(2, "0")}:
                  {eventDate.getMinutes().toString().padStart(2, "0")}
                </span>
                <span className="text-xs text-indigo-600 font-medium">
                  {event.duration !== undefined ? (
                    `${event.duration} min`
                  ) : (
                    <span className="text-green-600 font-medium">
                      not assigned
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-lg">
                {event.title}
              </h4>

              <div className="mt-1 grid grid-cols-[auto,1fr] gap-x-2 gap-y-0.5 text-xs">
                <span className="text-gray-500">Ora:</span>
                <span className="text-gray-700 font-medium">
                  {eventDate.toLocaleTimeString("ro-RO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {endTime.toLocaleTimeString("ro-RO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                {channel ? (
                  <>
                    <span className="text-gray-500">Canal:</span>
                    <span className="text-gray-700 font-medium">
                      #{channel.name}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-500">Status:</span>
                    <span className="text-green-600 font-medium">
                      not assigned in any team or channel yet
                    </span>
                  </>
                )}

                {creator && (
                  <>
                    <span className="text-gray-500">Organizator:</span>
                    <span className="text-gray-700 font-medium">
                      {creator.firstName} {creator.lastName}
                    </span>
                  </>
                )}

                {event.createdAt && (
                  <>
                    <span className="text-gray-500">Creat:</span>
                    <span className="text-gray-700">
                      {new Date(event.createdAt).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>

              <p className="text-sm text-gray-600 mt-2 mb-3">
                {event.description}
              </p>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex space-x-2">
                  <div className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    {attendees.length} participanți
                  </div>
                  {confirmedAttendees > 0 && (
                    <div className="bg-green-50 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                      {confirmedAttendees} confirmați
                    </div>
                  )}
                </div>

                {attendees.length > 0 && (
                  <div className="flex -space-x-2">
                    {attendees.slice(0, 4).map((attendee) => {
                      const status =
                        event.attendees?.find((a) => a.userId === attendee.id)
                          ?.status || "";

                      return (
                        <div
                          key={attendee.id}
                          className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                            status === "ACCEPTED"
                              ? "bg-gradient-to-br from-green-100 to-green-200"
                              : status === "DECLINED"
                              ? "bg-gradient-to-br from-red-100 to-red-200"
                              : "bg-gradient-to-br from-blue-100 to-indigo-100"
                          }`}
                          title={`${attendee.firstName || ""} ${
                            attendee.lastName || ""
                          } (${
                            status === "ACCEPTED"
                              ? "Confirmat"
                              : status === "DECLINED"
                              ? "Respins"
                              : "În așteptare"
                          })`}
                        >
                          {attendee.firstName
                            ? attendee.firstName.charAt(0).toUpperCase()
                            : attendee.email
                            ? attendee.email.charAt(0).toUpperCase()
                            : "?"}
                        </div>
                      );
                    })}
                    {attendees.length > 4 && (
                      <div className="w-7 h-7 rounded-full bg-gray-100 text-xs flex items-center justify-center border-2 border-white font-medium text-gray-600 shadow-sm">
                        +{attendees.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (err) {
    console.error("Error rendering event card:", err, event);
    return null;
  }
};

export default CalendarPage;
