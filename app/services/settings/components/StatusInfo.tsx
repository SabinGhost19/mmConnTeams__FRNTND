import React from "react";
import { Activity } from "lucide-react";
import { UserTeam } from "@/app/types/models_types/userType";

interface StatusInfoProps {
  userData: UserTeam | null;
}

const StatusInfo = ({ userData }: StatusInfoProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-start gap-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
        <Activity className="h-6 w-6 text-green-500" />
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold text-lg text-gray-800 mb-3">Status</h3>
        <div className="flex flex-col sm:flex-row sm:items-center">
          <span className="text-gray-500 w-28">Status:</span>
          <span className="text-gray-800">
            {userData?.status || "No status available"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatusInfo;
