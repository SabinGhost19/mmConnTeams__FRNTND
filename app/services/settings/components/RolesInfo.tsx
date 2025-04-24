import React from "react";
import { Shield } from "lucide-react";
import { UserTeam } from "@/app/types/models_types/userType";

interface RolesInfoProps {
  userData: UserTeam | null;
}

const RolesInfo = ({ userData }: RolesInfoProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-start gap-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
        <Shield className="h-6 w-6 text-purple-500" />
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold text-lg text-gray-800 mb-3">Roles</h3>
        <div className="flex flex-col sm:flex-row sm:items-center">
          <span className="text-gray-500 w-28">Roles:</span>
          <div className="flex flex-wrap gap-2">
            {userData?.roles && userData.roles.length > 0 ? (
              userData.roles.map((role, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                >
                  {role}
                </span>
              ))
            ) : (
              <span className="text-gray-800">No roles assigned</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesInfo;
