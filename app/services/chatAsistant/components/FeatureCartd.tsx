// components/chat/FeatureCard.tsx
import React, { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  bgColor: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  bgColor,
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md">
      <div
        className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center mb-3`}
      >
        {icon}
      </div>
      <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

export default FeatureCard;
