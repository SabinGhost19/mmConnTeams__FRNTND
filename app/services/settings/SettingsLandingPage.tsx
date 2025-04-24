"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserTeam } from "@/app/types/models_types/userType";
import { api } from "@/app/lib/api";
import { getAvatarUrl } from "@/app/lib/userUtils";
import {
  ArrowLeft,
  User,
  Mail,
  Building2,
  Shield,
  Edit,
  Camera,
  Phone,
  GraduationCap,
  BookOpen,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  FileText,
} from "lucide-react";
import { UserProfileDTO } from "./types";
import ProfileHeader from "./components/ProfileHeader";
import ProfileImage from "./components/ProfileImage";
import UserInfo from "./components/UserInfo";
import BioSection from "./components/BioSection";
import ContactInfo from "./components/ContactInfo";
import EducationInfo from "./components/EducationInfo";
import DepartmentInfo from "./components/DepartmentInfo";
import RolesInfo from "./components/RolesInfo";
import StatusInfo from "./components/StatusInfo";
import TermsPrivacyInfo from "./components/TermsPrivacyInfo";
import AccountInfo from "./components/AccountInfo";
import EditProfileModal from "./components/EditProfileModal";

const SettingsLandingPage = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserTeam | null>(null);
  const [profileData, setProfileData] = useState<UserProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile details
        const profileDetailsResponse = await api.get(
          "/api/users/current/profile"
        );
        console.log("Profile details:", profileDetailsResponse.data);
        setProfileData(profileDetailsResponse.data);

        // Fetch user data
        const response = await api.get("/api/users/current");
        console.log("User data:", response.data);
        setUserData(response.data);

        if (response.data?.profileImage) {
          try {
            setImageUrl(response.data.profileImage);
          } catch (imgErr) {
            console.error("Error loading profile image:", imgErr);
            setImageError(true);
          }
        }
      } catch (err) {
        setError("Failed to load user data");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleProfileUpdate = (updatedProfile: UserProfileDTO) => {
    setProfileData(updatedProfile);
  };

  const handleImageError = () => {
    console.error("Failed to load profile image");
    setImageError(true);
  };

  // Generate a fallback avatar URL based on the user's name
  const getFallbackAvatarUrl = () => {
    if (!userData) return "";
    const name =
      `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=0D8ABC&color=fff&size=200`;
  };

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
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
            onClick={() => router.push("/teams")}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Teams
          </button>
        </div>
      </div>
    );
  }

  // Use the direct image URL if available and no error, otherwise use the fallback
  const displayImageUrl =
    imageUrl && !imageError ? imageUrl : getFallbackAvatarUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <ProfileHeader />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <ProfileImage
                imageUrl={displayImageUrl}
                onImageError={handleImageError}
              />
              <UserInfo
                userData={userData}
                profileData={profileData}
                onEditClick={handleEditClick}
              />
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
                <TermsPrivacyInfo profileData={profileData} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        userData={userData}
        profileData={profileData}
        onSave={handleProfileUpdate}
      />
    </div>
  );
};

export default SettingsLandingPage;
