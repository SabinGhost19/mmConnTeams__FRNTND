import React, { useState } from "react";
import { UserProfileDTO } from "../types";
import ProfileImageUpload from "./ProfileImageUpload";

interface ProfileImageProps {
  profileData: UserProfileDTO | null;
  userData: any;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  profileData,
  userData,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageUpdate = (newImageUrl: string) => {
    setImageUrl(newImageUrl);
    setImageError(false);
  };

  const getInitials = () => {
    if (userData) {
      const firstInitial = userData.firstName
        ? userData.firstName.charAt(0)
        : "";
      const lastInitial = userData.lastName ? userData.lastName.charAt(0) : "";
      return `${firstInitial}${lastInitial}`.toUpperCase();
    }
    return "U";
  };

  const getFallbackAvatarUrl = () => {
    const initials = getInitials();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      initials
    )}&background=0D8ABC&color=fff&size=200`;
  };

  return (
    <div className="relative">
      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
        {!imageError && (profileData?.profileImageUrl || imageUrl) ? (
          <img
            src={imageUrl || profileData?.profileImageUrl}
            alt={`${userData?.firstName || ""} ${userData?.lastName || ""}`}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <img
            src={getFallbackAvatarUrl()}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Add the ProfileImageUpload component */}
      <ProfileImageUpload
        currentImageUrl={profileData?.profileImageUrl || ""}
        onImageUpdate={handleImageUpdate}
      />
    </div>
  );
};

export default ProfileImage;
