// components/TeamsLanding/CreateChannelModal.tsx
"use client";

import React, { useState, useRef } from "react";
import { api as axios } from "@/app/lib/api";
import { useRouter } from "next/navigation";

// Define the ChannelDTO interface to match the backend expectation
interface ChannelDTO {
  id?: string;
  teamId: string;
  name: string;
  description?: string;
  isPrivate: boolean;
}

interface CreateChannelModalProps {
  teamId: string;
  onClose: () => void;
  onSubmit: (channelData: ChannelDTO) => void;
}

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  teamId,
  onClose,
  onSubmit,
}) => {
  const router = useRouter();
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReloading, setIsReloading] = useState(false);

  // Use a ref to track if the component is still mounted
  const isMountedRef = useRef(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!channelName.trim()) {
      setError("Numele canalului este obligatoriu");
      return;
    }

    // Check if channel name contains spaces
    if (channelName.includes(" ")) {
      setError(
        "Numele canalului nu poate conține spații. Folosește cratime (-) sau underscore (_)."
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    // Create the ChannelDTO object
    const channelDTO: ChannelDTO = {
      teamId: teamId,
      name: channelName,
      description: channelDescription || undefined,
      isPrivate: false,
    };

    try {
      const response = await axios.post<ChannelDTO>("/api/channel", channelDTO);

      // Call onSubmit with the response data
      if (response.data) {
        onSubmit(response.data);
      }

      // Set reloading flag to prevent error display during reload
      setIsReloading(true);

      // Close the modal
      onClose();

      // Small delay before reload to prevent race conditions
      setTimeout(() => {
        // Full page reload (equivalent to Ctrl+R)
        window.location.reload();
      }, 100);
    } catch (error: any) {
      // Only show errors if we're not already reloading the page and component is still mounted
      if (!isReloading && isMountedRef.current) {
        console.error("Eroare la crearea canalului:", error);

        // Filter out aborted request errors
        if (
          error.message === "Request aborted" ||
          error.code === "ECONNABORTED"
        ) {
          // Don't display these errors to the user
          console.log("Request was aborted during page transition");
        } else if (error.response?.data?.message) {
          setError(`Eroare: ${error.response.data.message}`);
        } else if (error.message) {
          setError(`Eroare: ${error.message}`);
        } else {
          setError(
            "A apărut o eroare la crearea canalului. Vă rugăm încercați din nou."
          );
        }

        setIsLoading(false);
      }
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
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close"
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
                  disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>

            {error && !isReloading && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="text-sm text-gray-500">
              <p>După creare, poți adăuga membri sau configura integrări.</p>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isReloading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={isLoading || isReloading}
              className="relative px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="opacity-0">Creează canal</span>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                  </span>
                </>
              ) : (
                "Creează canal"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChannelModal;
