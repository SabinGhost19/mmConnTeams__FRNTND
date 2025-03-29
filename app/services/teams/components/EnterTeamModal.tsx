// components/TeamsLanding/EnterTeamModal.tsx
"use client";
import React, { useState } from "react";

interface EnterTeamModalProps {
  onClose: () => void;
  onEnterTeam: (teamId: string) => void; // Modifică tipul la string
}

const EnterTeamModal: React.FC<EnterTeamModalProps> = ({
  onClose,
  onEnterTeam,
}) => {
  const [teamId, setTeamId] = useState<string>(""); // Păstrează ca string
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamId.trim()) {
      setError("Introduceți un ID de echipă valid!");
      return;
    }

    try {
      const uuid = teamId.trim();
      onEnterTeam(uuid);
      onClose();
    } catch (err) {
      setError("ID de echipă invalid!");
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Intră în echipă după ID
          </h2>
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

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="teamId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ID Echipă
            </label>
            <input
              type="text"
              id="teamId"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              placeholder="Introdu ID-ul echipei"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Anulează
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Intră
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnterTeamModal;
