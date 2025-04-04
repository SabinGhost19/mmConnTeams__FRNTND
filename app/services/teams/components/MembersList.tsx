// components/TeamsLanding/MembersList.tsx
"use client";
import React, { useState } from "react";
import { UserTeam } from "@/app/types/models_types/userType";

// Definim tipul pentru gruparea membrilor după departament
interface MembersByDepartment {
  [department: string]: UserTeam[];
}

// Props pentru componenta principală
interface MembersListProps {
  teamId: string;
  members: UserTeam[];
  onStartChat: (userId: string) => void;
  onInviteUser: () => void;
}

// Props pentru componenta MemberCard
interface MemberCardProps {
  member: UserTeam;
  statusColor: string;
  onStartChat: () => void;
}

// Opțiuni pentru sortare
type SortByOption = "status" | "name" | "department";

const MembersList: React.FC<MembersListProps> = ({
  teamId,
  members,
  onStartChat,
  onInviteUser,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortByOption>("status");

  // Filtrare după textul căutat
  const filteredMembers = members.filter(
    (member) =>
      `${member.firstName} ${member.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      member.roles
        .join(", ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (member.department?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      )
  );

  // Sortare membri
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const aName = `${a.firstName} ${a.lastName}`;
    const bName = `${b.firstName} ${b.lastName}`;

    if (sortBy === "name") {
      return aName.localeCompare(bName);
    } else if (sortBy === "department") {
      return (a.department || "").localeCompare(b.department || "");
    } else {
      // Status - online first, then other statuses
      if (a.status === "online" && b.status !== "online") return -1;
      if (a.status !== "online" && b.status === "online") return 1;
      return aName.localeCompare(bName);
    }
  });

  // Grupare membri după departament
  const membersByDepartment = sortedMembers.reduce<MembersByDepartment>(
    (acc, member) => {
      const department = member.department || "Fără departament";
      if (!acc[department]) {
        acc[department] = [];
      }
      acc[department].push(member);
      return acc;
    },
    {}
  );

  // Obține status color pentru avatar
  const getStatusColor = (status?: string): string => {
    switch (status) {
      case "online":
        return "bg-green-400";
      case "busy":
        return "bg-red-400";
      case "away":
        return "bg-yellow-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-bold text-gray-800">Membri</h2>
        <button
          onClick={onInviteUser}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          Invită membri
        </button>
      </div>

      {/* Search & Sort */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Caută membru..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex">
            <label className="mr-2 text-sm text-gray-600 flex items-center">
              Sortează:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortByOption)}
              className="border rounded-lg text-sm px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="status">Status</option>
              <option value="name">Nume</option>
              <option value="department">Departament</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      {sortedMembers.length > 0 ? (
        <div className="p-6">
          {sortBy === "department" ? (
            // Grupare după departament când sortarea este după departament
            Object.entries(membersByDepartment).map(
              ([department, deptMembers]) => (
                <div key={department} className="mb-8 last:mb-0">
                  <h3 className="font-medium text-gray-900 mb-4 text-lg">
                    {department}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deptMembers.map((member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        statusColor={getStatusColor(member.status)}
                        onStartChat={() => onStartChat(member.id)}
                      />
                    ))}
                  </div>
                </div>
              )
            )
          ) : (
            // Afișare simplă, fără grupare, pentru alte tipuri de sortare
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  statusColor={getStatusColor(member.status)}
                  onStartChat={() => onStartChat(member.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">Niciun membru găsit</p>
          <p className="text-gray-500 text-sm mb-4">
            {searchQuery
              ? "Încearcă un alt termen de căutare sau invită membri noi."
              : "Începe prin a invita membri în echipă."}
          </p>
          <button
            onClick={onInviteUser}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            Invită membri
          </button>
        </div>
      )}
    </div>
  );
};

// Component pentru cardul de membru
const MemberCard: React.FC<MemberCardProps> = ({
  member,
  statusColor,
  onStartChat,
}) => {
  const fullName = `${member.firstName} ${member.lastName}`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <div className="relative">
          <img
            src={
              member.profileImage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                fullName
              )}&background=0D8ABC&color=fff`
            }
            alt={fullName}
            className="w-12 h-12 rounded-full"
          />
          <span
            className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${statusColor}`}
          ></span>
        </div>

        <div className="ml-3 flex-1">
          <h3 className="font-medium text-gray-900">{fullName}</h3>
          <p className="text-sm text-gray-500">{member.roles.join(", ")}</p>
          {member.department && (
            <p className="text-xs text-gray-500 mt-1">{member.department}</p>
          )}
        </div>

        <button
          onClick={onStartChat}
          className="text-blue-600 hover:text-blue-800 p-1"
          title="Start chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MembersList;
