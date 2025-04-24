import React from "react";
import { UserProfileDTO } from "../types";

interface BioSectionProps {
  profileData: UserProfileDTO | null;
}

const BioSection = ({ profileData }: BioSectionProps) => {
  if (!profileData?.bio) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6">
      <div className="p-6">
        <h3 className="font-semibold text-lg text-gray-800 mb-2">About Me</h3>
        <p className="text-gray-700">{profileData.bio}</p>
      </div>
    </div>
  );
};

export default BioSection;
