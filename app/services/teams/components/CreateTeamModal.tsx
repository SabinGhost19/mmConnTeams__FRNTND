"use client";

import React, { useState, useRef } from "react";
import { api as axios } from "@/app/lib/api";

interface CreateTeamModalProps {
  onClose: () => void;
  onSubmit: (teamData: {
    name: string;
    description: string;
    id: string;
  }) => void;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);

      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) {
      return; // Simple validation
    }

    setIsLoading(true);
    setError(null);

    try {
      // First request: Create team and get team ID
      const response = await axios.post("/api/teams", {
        name: teamName,
        description: teamDescription,
      });
      console.log("Main response from FIRST REQUEST: !!!!!!", response.data);

      if (response.data) {
        const teamId = response.data;

        // Second request: Upload image if one was selected
        if (selectedImage) {
          const formData = new FormData();
          formData.append("image", selectedImage);
          formData.append("teamId", teamId);
          console.log("Acum SE TRIMITE AL DOILEA..................");
          await axios.post("/api/teams/upload-image", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        }
        console.log("!?????????????????????????!!!!!!!!!..................");
        console.log("Team created successfully:", response.data);

        // Call onSubmit with the team data
        onSubmit({
          name: teamName,
          description: teamDescription,
          id: teamId,
        });

        onClose(); // Close the modal
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
                Imagine echipă
              </label>
              <div className="flex items-center justify-center">
                <div
                  onClick={handleImageClick}
                  className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <>
                      <svg
                        className="h-8 w-8 text-gray-400"
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
                      <span className="mt-2 text-xs text-gray-500">
                        Încarcă imagine
                      </span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="mt-2 text-xs text-center text-gray-500">
                {selectedImage && (
                  <span>Fișier selectat: {selectedImage.name}</span>
                )}
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
              disabled={isLoading}
            >
              Anulează
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? "Se crează..." : "Creează echipa"}
            </button>
          </div>

          {error && (
            <div className="px-6 pb-4 text-red-500 text-sm">{error}</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal;
