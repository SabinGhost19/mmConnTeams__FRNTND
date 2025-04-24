import React from "react";
import { Calendar } from "lucide-react";
import { UserProfileDTO } from "../types";

interface AccountInfoProps {
  profileData: UserProfileDTO | null;
}

const AccountInfo = ({ profileData }: AccountInfoProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="flex flex-col md:flex-row md:items-start gap-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <Calendar className="h-6 w-6 text-blue-500" />
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold text-lg text-gray-800 mb-3">
          Account Information
        </h3>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className="text-gray-500 w-28">Created:</span>
            <span className="text-gray-800">
              {profileData?.createdAt
                ? formatDate(profileData.createdAt)
                : "N/A"}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className="text-gray-500 w-28">Last Updated:</span>
            <span className="text-gray-800">
              {profileData?.updatedAt
                ? formatDate(profileData.updatedAt)
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;
