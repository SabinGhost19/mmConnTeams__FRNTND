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

// Define the UserProfileDTO interface
interface UserProfileDTO {
  id: string;
  userId: string;
  institution: string;
  studyLevel: string;
  specialization: string;
  year: number;
  group: string;
  bio: string;
  profileImageUrl: string;
  phoneNumber: string;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

const SettingsLandingPage = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserTeam | null>(null);
  const [profileData, setProfileData] = useState<UserProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

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

        // If we have a profile image, try to validate it
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
      {/* Header with back button */}
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => router.push("/teams")}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Back to Teams</span>
          </button>
          <h1 className="text-xl font-bold text-center">User Profile</h1>
          <div className="w-24"></div> {/* Spacer for balance */}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card - Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative">
                {/* Profile Image Banner */}
                <div className="w-full h-64 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20"></div>
                  </div>

                  {/* Profile Image - Centered in the banner */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-40 h-40 rounded-full border-6 border-white bg-white shadow-xl overflow-hidden ring-4 ring-blue-100">
                        {displayImageUrl ? (
                          <img
                            src={displayImageUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={handleImageError}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                            <User className="h-20 w-20 text-blue-500" />
                          </div>
                        )}
                      </div>
                      <button className="absolute bottom-2 right-2 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors transform hover:scale-110 duration-200">
                        <Camera className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* User Info */}
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
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <Edit className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {profileData?.bio && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6">
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    About Me
                  </h3>
                  <p className="text-gray-700">{profileData.bio}</p>
                </div>
              </div>
            )}
          </div>

          {/* Details Card - Right Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">
                  Account Details
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Contact Information */}
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
                          <span className="text-gray-800">
                            {profileData.phoneNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Education Information */}
                {(profileData?.institution ||
                  profileData?.studyLevel ||
                  profileData?.specialization ||
                  profileData?.year ||
                  profileData?.group) && (
                  <div className="flex flex-col md:flex-row md:items-start gap-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg text-gray-800 mb-3">
                        Education
                      </h3>
                      <div className="space-y-3">
                        {profileData?.institution && (
                          <div className="flex flex-col sm:flex-row sm:items-center">
                            <span className="text-gray-500 w-28">
                              Institution:
                            </span>
                            <span className="text-gray-800">
                              {profileData.institution}
                            </span>
                          </div>
                        )}
                        {profileData?.studyLevel && (
                          <div className="flex flex-col sm:flex-row sm:items-center">
                            <span className="text-gray-500 w-28">
                              Study Level:
                            </span>
                            <span className="text-gray-800">
                              {profileData.studyLevel}
                            </span>
                          </div>
                        )}
                        {profileData?.specialization && (
                          <div className="flex flex-col sm:flex-row sm:items-center">
                            <span className="text-gray-500 w-28">
                              Specialization:
                            </span>
                            <span className="text-gray-800">
                              {profileData.specialization}
                            </span>
                          </div>
                        )}
                        {profileData?.year && (
                          <div className="flex flex-col sm:flex-row sm:items-center">
                            <span className="text-gray-500 w-28">Year:</span>
                            <span className="text-gray-800">
                              {profileData.year}
                            </span>
                          </div>
                        )}
                        {profileData?.group && (
                          <div className="flex flex-col sm:flex-row sm:items-center">
                            <span className="text-gray-500 w-28">Group:</span>
                            <span className="text-gray-800">
                              {profileData.group}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Department */}
                <div className="flex flex-col md:flex-row md:items-start gap-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg text-gray-800 mb-3">
                      Department
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="text-gray-500 w-28">Department:</span>
                      <span className="text-gray-800">
                        {userData?.department || "No department assigned"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Roles */}
                <div className="flex flex-col md:flex-row md:items-start gap-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg text-gray-800 mb-3">
                      Roles
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {userData?.roles.map((role, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Account Information */}
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
                        <span className="text-gray-500 w-28">
                          Last Updated:
                        </span>
                        <span className="text-gray-800">
                          {profileData?.updatedAt
                            ? formatDate(profileData.updatedAt)
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Privacy */}
                <div className="flex flex-col md:flex-row md:items-start gap-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg text-gray-800 mb-3">
                      Terms & Privacy
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            profileData?.termsAccepted
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </span>
                        <span className="text-gray-800">
                          Terms Accepted:{" "}
                          {profileData?.termsAccepted ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            profileData?.privacyPolicyAccepted
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </span>
                        <span className="text-gray-800">
                          Privacy Policy Accepted:{" "}
                          {profileData?.privacyPolicyAccepted ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLandingPage;
