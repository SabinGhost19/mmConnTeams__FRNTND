import React from "react";
import { User, Camera } from "lucide-react";

interface ProfileImageProps {
  imageUrl: string | null;
  onImageError: () => void;
}

const ProfileImage = ({ imageUrl, onImageError }: ProfileImageProps) => {
  return (
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
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={onImageError}
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
  );
};

export default ProfileImage;
