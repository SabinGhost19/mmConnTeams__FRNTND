import React from "react";
import { Edit, Phone } from "lucide-react";
import { UserTeam } from "@/app/types/models_types/userType";
import { UserProfileDTO } from "../types";

interface UserInfoProps {
  userData: UserTeam | null;
  profileData: UserProfileDTO | null;
  onEditClick: () => void;
}

const UserInfo = ({ userData, profileData, onEditClick }: UserInfoProps) => {
  return (
    <div className="pt-20 pb-6 px-6 text-center">
      <h2 className="text-2xl font-bold text-gray-800">
        {userData?.firstName} {userData?.lastName}
      </h2>
      <p className="text-gray-500 mt-1">{userData?.email}</p>
      {profileData?.phoneNumber && (
        <p className="text-gray-500 mt-1 flex items-center justify-center gap-1">
          <Phone className="h-4 w-4" />
          {profileData.phoneNumber}
        </p>
      )}
      <div className="mt-4 flex justify-center">
        <button
          onClick={onEditClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Edit className="h-4 w-4" />
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
};

export default UserInfo;
