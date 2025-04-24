import React from "react";
import { Building2 } from "lucide-react";
import { UserTeam } from "@/app/types/models_types/userType";

interface DepartmentInfoProps {
  userData: UserTeam | null;
}

const DepartmentInfo = ({ userData }: DepartmentInfoProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-start gap-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <Building2 className="h-6 w-6 text-blue-500" />
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold text-lg text-gray-800 mb-3">Department</h3>
        <div className="flex flex-col sm:flex-row sm:items-center">
          <span className="text-gray-500 w-28">Department:</span>
          <span className="text-gray-800">
            {userData?.department || "No department available"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DepartmentInfo;
