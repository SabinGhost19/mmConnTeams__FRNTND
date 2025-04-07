import React, { useState, useEffect } from "react";
import Channel from "@/app/types/models_types/channel";

// Interface pentru datele de editare a canalului
interface EditChannelData {
  name: string;
  description: string;
}

interface EditChannelModalProps {
  channel: Channel;
  onClose: () => void;
  onSubmit: (channelData: EditChannelData) => void;
  isUpdating: boolean;
}

const EditChannelModal: React.FC<EditChannelModalProps> = ({
  channel,
  onClose,
  onSubmit,
  isUpdating,
}) => {
  const [channelData, setChannelData] = useState<EditChannelData>({
    name: "",
    description: "",
  });

  // Inițializează datele din canal atunci când componenta este montată
  useEffect(() => {
    setChannelData({
      name: channel.name,
      description: channel.description,
    });
  }, [channel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(channelData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Închide"
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

        <h2 className="text-2xl font-bold mb-6">Editare canal</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="channel-name"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Nume canal
            </label>
            <input
              type="text"
              id="channel-name"
              value={channelData.name}
              onChange={(e) =>
                setChannelData({
                  ...channelData,
                  name: e.target.value,
                })
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Introduceți numele canalului"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="channel-description"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Descriere
            </label>
            <textarea
              id="channel-description"
              value={channelData.description}
              onChange={(e) =>
                setChannelData({
                  ...channelData,
                  description: e.target.value,
                })
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
              placeholder="Introduceți o descriere pentru canal"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150"
            >
              Anulare
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ${
                isUpdating ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isUpdating ? "Se salvează..." : "Salvează"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditChannelModal;
