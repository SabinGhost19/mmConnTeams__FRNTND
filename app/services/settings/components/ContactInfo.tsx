import React from "react";
import { Mail, Phone } from "lucide-react";
import { UserTeam } from "@/app/types/models_types/userType";
import { UserProfileDTO } from "../types";

interface ContactInfoProps {
  userData: UserTeam | null;
  profileData: UserProfileDTO | null;
}

const ContactInfo = ({ userData, profileData }: ContactInfoProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-start gap-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <Mail className="h-6 w-6 text-blue-500" />
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold text-lg text-gray-800 mb-3">
          Contact Information
        </h3>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className="text-gray-500 w-28">Email:</span>
            <span className="text-gray-800">{userData?.email}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className="text-gray-500 w-28">Status:</span>
            <span className="text-gray-800">
              {userData?.status || "Active"}
            </span>
          </div>
          {profileData?.phoneNumber && (
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="text-gray-500 w-28">Phone:</span>
              <span className="text-gray-800">{profileData.phoneNumber}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
