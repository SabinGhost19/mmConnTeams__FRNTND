import React from "react";
import { FileText, CheckCircle } from "lucide-react";
import { UserProfileDTO } from "../types";

interface TermsPrivacyInfoProps {
  profileData: UserProfileDTO | null;
}

const TermsPrivacyInfo = ({ profileData }: TermsPrivacyInfoProps) => {
  return (
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
              Terms Accepted: {profileData?.termsAccepted ? "Yes" : "No"}
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
  );
};

export default TermsPrivacyInfo;
