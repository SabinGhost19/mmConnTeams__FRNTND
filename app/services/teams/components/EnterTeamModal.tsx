// components/TeamsLanding/EnterTeamModal.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface EnterTeamModalProps {
  onClose: () => void;
  onEnterTeam: (teamId: string) => Promise<any>;
}

const EnterTeamModal: React.FC<EnterTeamModalProps> = ({
  onClose,
  onEnterTeam,
}) => {
  const router = useRouter();
  const [teamId, setTeamId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!teamId.trim()) {
      setError("Please enter a valid team ID!");
      return;
    }

    try {
      setIsSubmitting(true);
      const trimmedTeamId = teamId.trim();
      console.log("Submitting team ID:", trimmedTeamId);

      // Wait for the server response
      const response = await onEnterTeam(trimmedTeamId);

      // Close the modal
      onClose();

      // Refresh the page to show updated data
      router.refresh();

      // Alternatively, you can use a full page reload if router.refresh() doesn't update all components
      // window.location.reload();
    } catch (err) {
      console.error("Error entering team:", err);
      setError("Invalid team ID or server error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Enter Team by ID</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
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
              Team ID
            </label>
            <input
              type="text"
              id="teamId"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              placeholder="Enter the team ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isSubmitting}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entering..." : "Enter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnterTeamModal;
