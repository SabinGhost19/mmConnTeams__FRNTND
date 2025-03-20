// components/TeamsLanding/TeamCalendar.tsx
"use client";
import React, { useState } from "react";

// Definirea interfețelor pentru toate tipurile de date
interface Channel {
  id: number;
  name: string;
  unreadCount: number;
}

interface Member {
  id: number;
  name: string;
  role?: string;
  department?: string;
  status: "online" | "busy" | "away" | "offline";
  avatar?: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: string | Date;
  duration: number;
  channelId: number;
  attendees: number[];
  teamId: number;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

interface TeamCalendarProps {
  teamId: number;
  events: Event[];
  members: Member[];
  channels: Channel[];
  onCreateEvent?: () => void;
}

// Tipul pentru modul de vizualizare
type ViewMode = "day" | "week" | "month";

const TeamCalendar: React.FC<TeamCalendarProps> = ({
  teamId,
  events,
  members,
  channels,
  onCreateEvent,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  // Funcții helper pentru calendar
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  // Generarea zilelor pentru calendar
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    const days: CalendarDay[] = [];

    // Zilele din luna anterioară pentru a umple prima săptămână
    const daysInPrevMonth = getDaysInMonth(year, month - 1);
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Zilele din luna curentă
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Zilele din luna următoare pentru a umple ultima săptămână
    const remainingDays = 42 - days.length; // 42 = 6 săptămâni * 7 zile
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  // Filtrare evenimente pentru o anumită zi
  const getEventsForDate = (date: Date): Event[] => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  // Funcții de navigare pentru calendar
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
  };

  // Formatare dată pentru afișare
  const formatMonth = (date: Date): string => {
    return date.toLocaleDateString("ro-RO", { month: "long", year: "numeric" });
  };

  // Generare zile calendar
  const calendarDays = generateCalendarDays();

  // Nume zile săptămână
  const weekdays: string[] = ["Du", "Lu", "Ma", "Mi", "Jo", "Vi", "Sâ"];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-bold text-gray-800">Calendar evenimente</h2>

        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
          >
            Astăzi
          </button>

          <button
            onClick={goToNextMonth}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {formatMonth(currentDate)}
          </h3>

          <div className="flex">
            <div className="flex border rounded-md overflow-hidden mr-4">
              <button
                onClick={() => setViewMode("day")}
                className={`px-3 py-1 text-sm ${
                  viewMode === "day"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Zi
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1 text-sm ${
                  viewMode === "week"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Săptămână
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1 text-sm ${
                  viewMode === "month"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Lună
              </button>
            </div>

            {onCreateEvent && (
              <button
                onClick={onCreateEvent}
                className="px-3 py-1 text-sm bg-yellow-500 text-white hover:bg-yellow-600 rounded-md flex items-center"
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
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Weekday headers */}
          {weekdays.map((weekday, index) => (
            <div
              key={index}
              className="text-center font-medium text-gray-700 text-sm py-2"
            >
              {weekday}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day.date);
            const isToday =
              new Date().toDateString() === day.date.toDateString();

            return (
              <div
                key={index}
                className={`aspect-square min-h-[100px] p-1 border ${
                  day.isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"
                } ${isToday ? "border-blue-500" : "border-gray-200"}`}
              >
                <div className="h-full flex flex-col">
                  <div
                    className={`text-right p-1 ${
                      isToday ? "text-blue-600 font-bold" : ""
                    }`}
                  >
                    {day.date.getDate()}
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {dayEvents.map((event) => {
                      const eventDate = new Date(event.date);
                      const channel = channels.find(
                        (c) => c.id === event.channelId
                      );

                      return (
                        <div
                          key={event.id}
                          className="mb-1 p-1 text-xs bg-blue-100 text-blue-800 rounded truncate cursor-pointer hover:bg-blue-200"
                          title={event.description}
                        >
                          <div className="font-medium">
                            {eventDate.toLocaleTimeString("ro-RO", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="truncate">{event.title}</div>
                          {channel && (
                            <div className="text-blue-600 truncate">
                              #{channel.name}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Buton de adăugare eveniment la ziua curentă dacă e ziua din luna curentă */}
                    {day.isCurrentMonth &&
                      onCreateEvent &&
                      dayEvents.length === 0 && (
                        <button
                          onClick={onCreateEvent}
                          className="w-full h-12 mt-2 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
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
                          <span className="text-xs">Adaugă</span>
                        </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming events list */}
        <div className="mt-8">
          <h3 className="font-bold text-gray-800 mb-4">Evenimente apropiate</h3>

          {events
            .filter((event) => new Date(event.date) >= new Date())
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            .slice(0, 5)
            .map((event) => {
              const eventDate = new Date(event.date);
              const channel = channels.find((c) => c.id === event.channelId);

              // Calculate attendees
              const attendees = event.attendees
                .map((id) => members.find((m) => m.id === id))
                .filter((member): member is Member => member !== undefined);

              return (
                <div
                  key={event.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex">
                    <div className="mr-4 text-center">
                      <div className="w-12 h-12 bg-blue-100 text-blue-800 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-sm font-bold">
                          {eventDate.getDate()}
                        </span>
                        <span className="text-xs">
                          {eventDate.toLocaleDateString("ro-RO", {
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {event.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          {eventDate.toLocaleTimeString("ro-RO", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          • {event.duration} min •
                          {channel ? ` #${channel.name}` : ""}
                        </div>

                        <div className="flex -space-x-1">
                          {attendees.slice(0, 3).map((attendee) => (
                            <img
                              key={attendee.id}
                              src={
                                attendee.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  attendee.name
                                )}&background=0D8ABC&color=fff`
                              }
                              alt={attendee.name}
                              className="w-6 h-6 rounded-full border border-white"
                            />
                          ))}

                          {attendees.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs border border-white">
                              +{attendees.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

          {events.filter((event) => new Date(event.date) >= new Date())
            .length === 0 && (
            <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600"
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
              </div>
              <p className="text-gray-600 mb-2">Niciun eveniment planificat</p>
              <p className="text-gray-500 text-sm mb-4">
                Nu există evenimente apropiate pentru această echipă.
              </p>

              {onCreateEvent && (
                <button
                  onClick={onCreateEvent}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm inline-flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
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
                  Adaugă primul eveniment
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamCalendar;
