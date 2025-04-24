import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const ProfileHeader = () => {
  const router = useRouter();

  return (
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
  );
};

export default ProfileHeader;
