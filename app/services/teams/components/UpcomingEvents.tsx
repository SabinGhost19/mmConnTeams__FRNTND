// components/TeamsLanding/UpcomingEvents.tsx
import React from "react";
import Team from "@/app/types/models_types/team";
import Event from "@/app/types/models_types/event";
import { UserTeam as User } from "@/app/types/models_types/userType";

interface UpcomingEventsProps {
  events: Event[];
  teams: Team[];
  users: User[];
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({
  events,
  teams,
  users,
}) => {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="font-bold text-gray-800">Evenimente apropiate</h2>
      </div>

      <div className="p-4">
        <ul className="divide-y divide-gray-200">
          {events.map((event) => {
            const eventDate = new Date(event.date);
            const isToday =
              new Date().toDateString() === eventDate.toDateString();
            const isTomorrow =
              new Date(Date.now() + 86400000).toDateString() ===
              eventDate.toDateString();

            // Find team name
            const team = teams.find((t) => t.id === event.teamId);

            // Calculate how many attendees are online
            const attendees = event.attendees
              .map((id) => users.find((u) => u.id === id))
              .filter((user): user is User => user !== undefined);

            const onlineAttendees = attendees.filter(
              (u) => u.status === "online"
            ).length;

            // Format date display
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
    </div>
  );
};

export default UpcomingEvents;
