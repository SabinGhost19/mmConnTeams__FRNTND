import React from "react";
import { GraduationCap } from "lucide-react";
import { UserProfileDTO } from "../types";

interface EducationInfoProps {
  profileData: UserProfileDTO | null;
}

const EducationInfo = ({ profileData }: EducationInfoProps) => {
  if (
    !profileData?.institution &&
    !profileData?.studyLevel &&
    !profileData?.specialization &&
    !profileData?.year &&
    !profileData?.group
  ) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row md:items-start gap-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <GraduationCap className="h-6 w-6 text-blue-500" />
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold text-lg text-gray-800 mb-3">Education</h3>
        <div className="space-y-3">
          {profileData?.institution && (
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="text-gray-500 w-28">Institution:</span>
              <span className="text-gray-800">{profileData.institution}</span>
            </div>
          )}
          {profileData?.studyLevel && (
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="text-gray-500 w-28">Study Level:</span>
              <span className="text-gray-800">{profileData.studyLevel}</span>
            </div>
          )}
          {profileData?.specialization && (
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="text-gray-500 w-28">Specialization:</span>
              <span className="text-gray-800">
                {profileData.specialization}
              </span>
            </div>
          )}
          {profileData?.year && (
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="text-gray-500 w-28">Year:</span>
              <span className="text-gray-800">{profileData.year}</span>
            </div>
          )}
          {profileData?.group && (
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="text-gray-500 w-28">Group:</span>
              <span className="text-gray-800">{profileData.group}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationInfo;
