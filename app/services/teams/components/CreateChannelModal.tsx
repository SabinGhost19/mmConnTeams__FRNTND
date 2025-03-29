// components/TeamsLanding/CreateChannelModal.tsx
"use client";

import React, { useState } from "react";
import { api as axios } from "@/app/lib/api";

interface CreateChannelModalProps {
  teamId: string;
  onClose: () => void;
  onSubmit: (channelData: {
    name: string;
    description: string;
    isPrivate: boolean;
  }) => void;
}

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  teamId,
  onClose,
  onSubmit,
}) => {
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!channelName.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/channel", {
        teamId: teamId,
        name: channelName, // Nu channelName ci name
        description: channelDescription,
        isPrivate: isPrivate,
      });

      if (response.data) {
        console.log("Channel creat:", response.data);
        onSubmit({
          name: channelName,
          description: channelDescription,
          isPrivate: isPrivate,
        });
        onClose();
      }
    } catch (error) {
      setError("A apărut o eroare la crearea canalului");
      console.error("Eroare la crearea canalului:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">
            Creează un canal nou
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
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

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="mb-4">
              <label
                htmlFor="channelName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Numele canalului <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  #
                </span>
                <input
                  type="text"
                  id="channelName"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="ex: general"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Numele canalului nu poate conține spații. Folosește cratime (-)
                sau underscore (_).
              </p>
            </div>

            <div className="mb-4">
              <label
                htmlFor="channelDescription"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descriere
              </label>
              <textarea
                id="channelDescription"
                value={channelDescription}
                onChange={(e) => setChannelDescription(e.target.value)}
                placeholder="Despre ce este acest canal?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="privateChannel"
                    name="privateChannel"
                    type="checkbox"
                    checked={isPrivate}
                    onChange={() => setIsPrivate(!isPrivate)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="privateChannel"
                    className="font-medium text-gray-700"
                  >
                    Canal privat
                  </label>
                  <p className="text-gray-500">
                    Acest canal va fi vizibil doar pentru membri invitați
                    specific.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>După creare, poți adăuga membri sau configura integrări.</p>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Anulează
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Creează canal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChannelModal;
