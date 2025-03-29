// components/TeamsLanding/CreateEventModal.tsx
import React from "react";

interface Member {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "online" | "busy" | "away" | "offline";
  avatar?: string;
}

interface Channel {
  id: string;
  name: string;
  unreadCount: number;
}

interface NewEvent {
  title: string;
  description: string;
  date: string;
  duration: number;
  channelId: string;
  attendees: number[];
  teamId: string;
}

interface CreateEventModalProps {
  teamId: string;
  channels: Channel[];
  members: Member[];
  onClose: () => void;
  onCreateEvent: (event: NewEvent) => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  teamId,
  channels,
  members,
  onClose,
  onCreateEvent,
}) => {
  // Handler pentru submitere
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Extrage valorile din formular
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const channelId = Number(formData.get("channelId"));
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const duration = Number(formData.get("duration"));

    // Convertim lista de participanți selectați
    const attendees: string[] = [];
    members.forEach((member) => {
      if (formData.get(`attendee-${member.id}`)) {
        attendees.push(member.id);
      }
    });

    // Combinăm data și ora într-un string ISO
    const dateTimeISO = `${date}T${time}:00`;

    // Creăm evenimentul
    onCreateEvent({
      title,
      description,
      date: dateTimeISO,
      channelId,
      duration,
      attendees,
      teamId,
    });

    // Resetăm formularul
    form.reset();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg mx-4 overflow-hidden">
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
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descriere
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
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
                defaultValue={new Date().toISOString().split("T")[0]}
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
                defaultValue="12:00"
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
              defaultValue="30"
              min="5"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Participanți */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Participanți
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center py-1">
                  <input
                    type="checkbox"
                    id={`attendee-${member.id}`}
                    name={`attendee-${member.id}`}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`attendee-${member.id}`}
                    className="ml-2 flex items-center"
                  >
                    <img
                      src={
                        member.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          member.name
                        )}&background=0D8ABC&color=fff`
                      }
                      alt={member.name}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <span className="text-sm text-gray-700">{member.name}</span>
                    {member.status === "online" && (
                      <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-400"></span>
                    )}
                  </label>
                </div>
              ))}
            </div>
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
