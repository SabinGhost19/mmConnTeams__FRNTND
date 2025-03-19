// components/chat/ChatFeatures.tsx
import React from "react";
import FeatureCard from "./FeatureCartd";
import RatingStars from "./RatingStars";
// Feature items data
const features = [
  {
    id: 1,
    title: "Răspuns rapid",
    description: "Timp mediu de răspuns sub 2 minute",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    bgColor: "bg-blue-100",
  },
  {
    id: 2,
    title: "100% Securizat",
    description: "Conversațiile tale sunt private și protejate",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-green-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    bgColor: "bg-green-100",
  },
  {
    id: 3,
    title: "Experți dedicați",
    description: "Echipă cu experiență în domeniu",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-purple-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    bgColor: "bg-purple-100",
  },
  {
    id: 4,
    title: "24/7 Disponibilitate",
    description: "Asistență non-stop, oricând ai nevoie",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-yellow-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    bgColor: "bg-yellow-100",
  },
];

const ChatFeatures: React.FC = () => {
  return (
    <div className="flex flex-col justify-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-6">
        Suport instant prin chat
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Obține răspunsuri la întrebările tale în timp real. Echipa noastră de
        experți este gata să te ajute cu orice problemă.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {features.map((feature) => (
          <FeatureCard
            key={feature.id}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            bgColor={feature.bgColor}
          />
        ))}
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <span className="text-gray-600">Încrederea clienților:</span>
        <RatingStars rating={4.9} />
        <span className="text-gray-600">4.9/5 din 1200+ review-uri</span>
      </div>
    </div>
  );
};

export default ChatFeatures;
