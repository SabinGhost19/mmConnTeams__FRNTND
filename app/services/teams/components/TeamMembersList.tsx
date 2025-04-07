"use client";
import React, { useState, useEffect } from "react";
import { UserTeam } from "@/app/types/models_types/userType";
import { FiSearch, FiUser } from "react-icons/fi";
import { api } from "@/app/lib/api";

interface TeamMembersListProps {
  teamId: string;
  onMemberSelect?: (memberId: string, isSelected: boolean) => void;
  selectedMembers?: string[];
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({
  teamId,
  onMemberSelect,
  selectedMembers = [],
}) => {
  const [members, setMembers] = useState<UserTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        console.log(
          `TeamMembersList: Începe fetch pentru membrii echipei cu ID ${teamId}`
        );
        const response = await api.get(`/api/teams/${teamId}/members`);

        console.log("TeamMembersList: MEMBRI ECHIPĂ (răspuns brut):", response);
        console.log("TeamMembersList: MEMBRI ECHIPĂ (date):", response.data);

        // Validate response data
        if (Array.isArray(response.data)) {
          // Filter out any invalid member objects
          const validMembers = response.data.filter(
            (member) =>
              member &&
              typeof member === "object" &&
              member.id &&
              (member.firstName || member.lastName || member.email)
          );
          console.log("TeamMembersList: MEMBRI VALIDAȚI:", validMembers);
          console.log("TeamMembersList: Date detaliate despre membri:");
          validMembers.forEach((member, index) => {
            console.log(`Membru ${index + 1}:`, {
              id: member.id,
              firstName: member.firstName,
              lastName: member.lastName,
              email: member.email,
              status: member.status,
              roles: member.roles,
              department: member.department,
              profileImage: member.profileImage,
              // Afișează toate proprietățile disponibile
              allProps: Object.keys(member),
            });
          });
          setMembers(validMembers);
        } else {
          console.error("Invalid response format:", response.data);
          setMembers([]);
          setError("Invalid data received from server");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching team members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [teamId]);

  const getRandomColor = (str: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    const charCode = str.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  const filteredMembers = members.filter((member) => {
    if (!member) return false;

    const searchTerm = searchQuery.toLowerCase();
    // Create fullName from firstName and lastName
    const fullName = `${member.firstName || ""} ${
      member.lastName || ""
    }`.trim();

    return (
      fullName.toLowerCase().includes(searchTerm) ||
      (member.email?.toLowerCase() || "").includes(searchTerm) ||
      (member.department?.toLowerCase() || "").includes(searchTerm)
    );
  });

  // Helper function to get full name
  const getFullName = (member: UserTeam) => {
    if (!member) return "";
    return (
      `${member.firstName || ""} ${member.lastName || ""}`.trim() ||
      "Membru nou"
    );
  };

  const handleToggleMember = (member: UserTeam) => {
    if (onMemberSelect) {
      const memberId = member.id.toString();
      const isCurrentlySelected = selectedMembers.includes(memberId);
      onMemberSelect(memberId, !isCurrentlySelected);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Membri ai echipei
          </h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {members.length} membri
          </span>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Caută membri după nume, email sau departament..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => {
            if (!member || !member.id) return null;
            const isSelected = selectedMembers.includes(member.id.toString());

            return (
              <div
                key={member.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                  isSelected ? "bg-blue-50" : ""
                }`}
                onClick={() => handleToggleMember(member)}
              >
                <div className="flex items-center space-x-4">
                  {member.profileImage ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={member.profileImage}
                      alt={getFullName(member)}
                    />
                  ) : (
                    <div
                      className={`flex items-center justify-center h-10 w-10 rounded-full ${getRandomColor(
                        getFullName(member)
                      )} text-white font-medium`}
                    >
                      {getFullName(member)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getFullName(member)}
                      </p>
                      {member.status === "online" && (
                        <span className="inline-block h-2 w-2 rounded-full bg-green-400"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {member.department || "Fără departament"}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {onMemberSelect && (
                      <div
                        className={`w-6 h-6 rounded-md border ${
                          isSelected
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "border-gray-300"
                        } flex items-center justify-center cursor-pointer`}
                      >
                        {isSelected && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    )}
                    {!onMemberSelect && (
                      <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Profil
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-6 py-12 text-center">
            <FiUser className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Niciun membru găsit
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery
                ? "Încearcă un alt termen de căutare"
                : "Echipa nu are membri încă"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMembersList;
