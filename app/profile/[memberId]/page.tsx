"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { UserTeam } from "@/app/types/models_types/userType";
import { api } from "@/app/lib/api";
import { ArrowLeft } from "lucide-react";
import { UserProfileDTO } from "@/app/services/settings/types";

// Import components from the settings page
import ProfileHeader from "@/app/services/settings/components/ProfileHeader";
import ProfileImage from "@/app/services/settings/components/ProfileImage";
import UserInfo from "@/app/services/settings/components/UserInfo";
import BioSection from "@/app/services/settings/components/BioSection";
import ContactInfo from "@/app/services/settings/components/ContactInfo";
import EducationInfo from "@/app/services/settings/components/EducationInfo";
import DepartmentInfo from "@/app/services/settings/components/DepartmentInfo";
import RolesInfo from "@/app/services/settings/components/RolesInfo";
import StatusInfo from "@/app/services/settings/components/StatusInfo";
import AccountInfo from "@/app/services/settings/components/AccountInfo";

interface MemberProfilePageProps {
  params: Promise<{
    memberId: string;
  }>;
}

export default function MemberProfilePage({ params }: MemberProfilePageProps) {
  // Use React.use() to unwrap the params promise
  const unwrappedParams = use(params);
  const { memberId } = unwrappedParams;

  const router = useRouter();
  const [userData, setUserData] = useState<UserTeam | null>(null);
  const [profileData, setProfileData] = useState<UserProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile details
        const profileDetailsResponse = await api.get(
          `/api/users/current/${memberId}/profile`
        );
        setProfileData(profileDetailsResponse.data);

        // Fetch user data
        const response = await api.get(`/api/users/current/${memberId}`);
        setUserData(response.data);
      } catch (err) {
        setError("Failed to load user data");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [memberId]);

  const handleBackClick = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <p className="text-red-500 mb-6 text-center">{error}</p>
          <button
            onClick={handleBackClick}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="py-4 px-6 bg-white shadow-md mb-4 flex items-center">
        <button
          onClick={handleBackClick}
          className="mr-4 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold">Member Profile</h1>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="flex flex-col items-center">
                <ProfileImage profileData={profileData} userData={userData} />
                <h1 className="text-2xl font-bold mt-4">
                  {userData?.firstName} {userData?.lastName}
                </h1>
                <p className="text-gray-600">{userData?.email}</p>
              </div>
              {/* Modified UserInfo without edit button */}
              <div className="p-6 space-y-4">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Department</span>
                  <span className="font-medium">
                    {userData?.department || "Not specified"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Role</span>
                  <span className="font-medium">
                    {userData?.roles?.join(", ") || "Not specified"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Status</span>
                  <div className="flex items-center">
                    <span
                      className={`inline-block h-2 w-2 rounded-full mr-2 ${
                        userData?.status === "online"
                          ? "bg-green-400"
                          : "bg-gray-400"
                      }`}
                    ></span>
                    <span className="font-medium capitalize">
                      {userData?.status || "Offline"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <BioSection profileData={profileData} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">
                  Account Details
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <ContactInfo userData={userData} profileData={profileData} />
                <EducationInfo profileData={profileData} />
                <DepartmentInfo userData={userData} />
                <RolesInfo userData={userData} />
                <StatusInfo userData={userData} />
                <AccountInfo profileData={profileData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
