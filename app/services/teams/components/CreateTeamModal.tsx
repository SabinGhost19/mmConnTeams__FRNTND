"use client";

import React, { useState } from "react";
import { api as axios } from "@/app/lib/api";
interface CreateTeamModalProps {
  onClose: () => void;
  onSubmit: (teamData: {
    name: string;
    icon: string;
    description: string;
  }) => void;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamIcon, setTeamIcon] = useState("💼");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Opțiuni de emoji pentru icon
  const iconOptions = [
    "💼",
    "💻",
    "📊",
    "🎯",
    "🚀",
    "🛠️",
    "📱",
    "🔍",
    "🎨",
    "📝",
    "🔬",
    "📚",
    "🏆",
    "🌐",
    "📈",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) {
      return; // Validare simplă
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/teams", {
        name: teamName,
        icon: teamIcon,
        description: teamDescription,
      });

      if (response.data) {
        console.log("Raspuns tams created: ");
        console.log(response.data);
        // Apelăm onSubmit cu datele echipei
        onSubmit({
          name: teamName,
          icon: teamIcon,
          description: teamDescription,
        });

        onClose(); // Închidem modalul
      }
    } catch (error) {
      setError("A apărut o eroare la crearea echipei");
      console.error("Eroare la crearea echipei:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">
            Creează o echipă nouă
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
                htmlFor="teamIcon"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pictogramă
              </label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setTeamIcon(icon)}
                    className={`w-10 h-10 flex items-center justify-center text-2xl border rounded-md ${
                      teamIcon === icon
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="teamName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Numele echipei <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="ex: Echipa de Marketing"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="teamDescription"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descriere
              </label>
              <textarea
                id="teamDescription"
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                placeholder="Descriere scurtă a echipei și a scopului său"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="text-sm text-gray-500">
              <p>
                După creare, poți invita membri și poți crea canale specifice.
              </p>
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
              Creează echipa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal;
