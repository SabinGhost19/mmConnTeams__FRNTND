"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import ChannelMessages from "./components/ChannelMessages";
import { getAccessToken } from "@/app/lib/auth-utils";
import { Team, Channel } from "./components/interface";

// Use a more NextJS friendly approach for styling
const fadeInAnimation = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
`;

// Color scheme variables
const colors = {
  primary: "#0d47a1", // Darker blue
  secondary: "#1565c0", // Secondary blue
  light: "#bbdefb", // Light blue
  dark: "#002171", // Very dark blue
  hover: "#e3f2fd", // Hover light blue
  background: "#e8f5fa", // Light blue/gray background
  message: {
    own: "#bbdefb", // Own message bubble (lighter blue)
    other: "#f5f5f5", // Other message bubble (light gray)
  },
};

// Function to generate a random color for team avatars
const getRandomColor = (seed: string): string => {
  const colors = [
    "#0d47a1", // Dark blue
    "#1565c0", // Blue
    "#1976d2", // Medium blue
    "#0277bd", // Light blue
    "#00838f", // Teal
    "#00695c", // Dark teal
    "#2e7d32", // Dark green
    "#558b2f", // Green
    "#6a1b9a", // Purple
    "#4527a0", // Deep purple
    "#283593", // Indigo
    "#c62828", // Red
    "#d84315", // Deep orange
    "#4e342e", // Brown
  ];

  // Use the seed string to deterministically select a color
  const hash = seed.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

const ChatPage = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamChannels, setTeamChannels] = useState<Record<string, Channel[]>>(
    {}
  );
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoverTeam, setHoverTeam] = useState<string | null>(null);
  const [showTeamDetails, setShowTeamDetails] = useState(false);
  const teamHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs to avoid dependency cycles and track state across renders
  const teamsRef = useRef<Team[]>([]);
  const teamChannelsRef = useRef<Record<string, Channel[]>>({});
  const selectedTeamRef = useRef<string>("");
  const selectedChannelRef = useRef<string | null>(null);
  const apiCallCountRef = useRef<{ teams: number; channels: number }>({
    teams: 0,
    channels: 0,
  });

  // Update refs when state changes
  useEffect(() => {
    teamsRef.current = teams;
  }, [teams]);

  useEffect(() => {
    teamChannelsRef.current = teamChannels;
  }, [teamChannels]);

  useEffect(() => {
    selectedTeamRef.current = selectedTeam;
  }, [selectedTeam]);

  useEffect(() => {
    selectedChannelRef.current = selectedChannel;
  }, [selectedChannel]);

  // In a real app, get this from authentication context
  const currentUserId = "current-user-id";

  // Fetch all teams for the current user - with no dependencies
  const fetchTeams = useCallback(async () => {
    try {
      apiCallCountRef.current.teams++;
      console.log(`Fetching teams (call #${apiCallCountRef.current.teams})`);

      // Don't fetch again if we already have teams and this isn't the first call
      if (teamsRef.current.length > 0 && apiCallCountRef.current.teams > 1) {
        console.log("Teams already loaded, skipping fetch");
        return;
      }

      setIsLoading(true);
      setError(null);

      const token = getAccessToken();
      if (!token) {
        setError("No authentication token found");
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:8080/api/teams", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch teams: ${response.status}`);
      }

      const data: Team[] = await response.json();
      console.log(`Loaded ${data.length} teams`);

      setTeams(data);
      teamsRef.current = data;

      // Initialize channel fetching for all teams
      const initialTeamChannels: Record<string, Channel[]> = {};
      data.forEach((team) => {
        initialTeamChannels[team.id] = [];
      });

      setTeamChannels(initialTeamChannels);
      teamChannelsRef.current = initialTeamChannels;

      // Auto-select the first team if none is selected
      if (data.length > 0 && !selectedTeamRef.current) {
        const firstTeamId = data[0].id;
        console.log(`Auto-selecting first team: ${firstTeamId}`);
        setSelectedTeam(firstTeamId);
        selectedTeamRef.current = firstTeamId;
      }

      // Fetch channels for all teams
      data.forEach((team) => {
        fetchTeamChannels(team.id);
      });
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies to prevent recreation

  // Fetch channels for a team - with no dependencies
  const fetchTeamChannels = useCallback(async (teamId: string) => {
    if (!teamId) return;

    try {
      apiCallCountRef.current.channels++;
      console.log(
        `Fetching channels for team ${teamId} (call #${apiCallCountRef.current.channels})`
      );

      // Skip if we already have channels for this team and this isn't the first call
      if (
        teamChannelsRef.current[teamId]?.length > 0 &&
        apiCallCountRef.current.channels > 1
      ) {
        console.log(
          `Channels for team ${teamId} already loaded, skipping fetch`
        );
        return;
      }

      const token = getAccessToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/teams/${teamId}/channels`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch channels: ${response.status}`);
      }

      const data: Channel[] = await response.json();
      console.log(`Loaded ${data.length} channels for team ${teamId}`);

      // Update channels for this team
      setTeamChannels((prev) => {
        const updated = {
          ...prev,
          [teamId]: data,
        };
        teamChannelsRef.current = updated;
        return updated;
      });

      // Auto-select the first channel if none is selected or the current one isn't in this team
      if (data.length > 0) {
        const currentChannels = teamChannelsRef.current[teamId] || [];
        const channelExists = currentChannels.some(
          (c) => c.id === selectedChannelRef.current
        );

        if (!selectedChannelRef.current || !channelExists) {
          console.log(`Auto-selecting first channel: ${data[0].id}`);
          setSelectedChannel(data[0].id);
          selectedChannelRef.current = data[0].id;
        }
      }
    } catch (err) {
      console.error(`Error fetching channels for team ${teamId}:`, err);
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, []);

  // Initial load of teams
  useEffect(() => {
    console.log("Initial teams load effect running");
    fetchTeams();
  }, []); // Empty dependency array - run once on mount

  // Load channels when team changes
  useEffect(() => {
    if (selectedTeam) {
      console.log(`Team selection changed to: ${selectedTeam}`);
      fetchTeamChannels(selectedTeam);
    }
  }, [selectedTeam, fetchTeamChannels]);

  // Handle channel selection with stable reference
  const handleChannelSelect = useCallback(
    (channelId: string, teamId: string) => {
      console.log(`Channel selected: ${channelId} in team: ${teamId}`);
      setSelectedTeam(teamId);
      selectedTeamRef.current = teamId;
      setSelectedChannel(channelId);
      selectedChannelRef.current = channelId;
    },
    []
  );

  // Handle team hover
  const handleTeamHover = useCallback((teamId: string, isHovering: boolean) => {
    if (isHovering) {
      setHoverTeam(teamId);

      // Clear any existing timeout
      if (teamHoverTimeoutRef.current) {
        clearTimeout(teamHoverTimeoutRef.current);
      }

      // Set a timeout to show the team details after 1.5 seconds
      teamHoverTimeoutRef.current = setTimeout(() => {
        setShowTeamDetails(true);
      }, 1500);
    } else {
      // Clear the timeout if mouse leaves before it triggers
      if (teamHoverTimeoutRef.current) {
        clearTimeout(teamHoverTimeoutRef.current);
        teamHoverTimeoutRef.current = null;
      }
      setShowTeamDetails(false);
      setHoverTeam(null);
    }
  }, []);

  // Loading state
  if (isLoading && teams.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading teams...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => {
            apiCallCountRef.current = { teams: 0, channels: 0 };
            fetchTeams();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Find current team and channel
  const currentTeam = teams.find((team) => team.id === selectedTeam);
  const currentChannel =
    selectedChannel &&
    teamChannels[selectedTeam]?.find(
      (channel) => channel.id === selectedChannel
    );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>

      {/* Teams and Channels Sidebar */}
      <div className="w-72 bg-[#f0f2f5] border-r border-gray-200 overflow-y-auto flex flex-col">
        <div className="px-4 py-3 bg-[#0d47a1] text-white">
          <h2 className="text-xl font-semibold">Team Chat</h2>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className="uppercase text-xs font-semibold text-gray-500 tracking-wider mb-4 pl-2">
            Teams & Channels
          </h3>
          <div className="space-y-4">
            {teams.map((team) => (
              <div key={team.id} className="space-y-1 relative mb-2">
                <div
                  className={`p-2 rounded-lg cursor-default transition-colors ${
                    selectedTeam === team.id
                      ? "bg-[#bbdefb] text-[#0d47a1] font-medium"
                      : "text-[#111b21] hover:bg-[#e3f2fd]"
                  }`}
                  onMouseEnter={() => handleTeamHover(team.id, true)}
                  onMouseLeave={() => handleTeamHover(team.id, false)}
                >
                  <div className="flex items-center">
                    <div
                      className="h-8 w-8 rounded-full text-white flex items-center justify-center mr-3 text-sm font-medium"
                      style={{ backgroundColor: getRandomColor(team.id) }}
                    >
                      {team.icon || team.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{team.name}</span>
                    {team.unreadCount > 0 && (
                      <span className="ml-auto bg-[#0d47a1] text-white rounded-full text-xs px-2 py-0.5">
                        {team.unreadCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Team details popup */}
                {showTeamDetails && hoverTeam === team.id && (
                  <div
                    className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-72 animate-fade-in"
                    style={{
                      left: "calc(15rem)",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    <div className="flex items-center mb-3">
                      <div
                        className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold mr-3"
                        style={{ backgroundColor: getRandomColor(team.id) }}
                      >
                        {team.name.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {team.name}
                      </h3>
                    </div>
                    <div className="mb-3 text-sm text-gray-600 border-b border-gray-100 pb-3">
                      <p className="flex items-center mb-1">
                        <span className="mr-2">👥</span>
                        <span>
                          Members: {team.members ? team.members.length : "N/A"}
                        </span>
                      </p>
                      <p className="flex items-center">
                        <span className="mr-2">📅</span>
                        <span>Created: {new Date().toLocaleDateString()}</span>
                      </p>
                    </div>
                    <p className="text-sm text-gray-700">
                      {team.description || "No description available"}
                    </p>
                  </div>
                )}

                <div className="ml-10 space-y-0.5 mt-1">
                  {teamChannels[team.id]?.map((channel) => (
                    <div
                      key={channel.id}
                      className={`p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedChannel === channel.id
                          ? "bg-[#bbdefb] text-[#0d47a1]"
                          : "hover:bg-[#e3f2fd] text-[#111b21]"
                      }`}
                      onClick={() => handleChannelSelect(channel.id, team.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          {channel.isPrivate ? "🔒" : "#"} {channel.name}
                        </span>
                        {channel.unreadCount > 0 && (
                          <span className="bg-[#0d47a1] text-white rounded-full text-xs px-1.5 py-0.5">
                            {channel.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {teamChannels[team.id]?.length === 0 && (
                    <div className="text-xs text-gray-400 p-2">
                      No channels available
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User profile */}
        <div className="p-3 border-t border-gray-300 bg-[#f0f2f5]">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#0d47a1] text-white flex items-center justify-center font-semibold mr-3">
              {currentUserId.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium">Current User</div>
              <div className="text-xs text-[#0d47a1]">Online</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div
        className="flex-1 flex flex-col"
        style={{
          background: `linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #e0f7fa 100%)`,
        }}
      >
        {selectedChannel ? (
          <>
            {/* Channel header */}
            {teamChannels[selectedTeam]?.find(
              (channel) => channel.id === selectedChannel
            ) && (
              <div className="bg-[#f0f2f5] border-b border-gray-200 px-4 py-3 flex items-center shadow-sm">
                <div
                  className="h-10 w-10 rounded-full text-white flex items-center justify-center mr-3 font-semibold"
                  style={{ backgroundColor: getRandomColor(selectedTeam) }}
                >
                  {teamChannels[selectedTeam]
                    ?.find((c) => c.id === selectedChannel)
                    ?.name.charAt(0)
                    .toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold flex items-center">
                    <span>
                      {teamChannels[selectedTeam]?.find(
                        (c) => c.id === selectedChannel
                      )?.isPrivate ? (
                        <span className="mr-1">🔒</span>
                      ) : (
                        <span className="mr-1">#</span>
                      )}
                      {
                        teamChannels[selectedTeam]?.find(
                          (c) => c.id === selectedChannel
                        )?.name
                      }
                    </span>
                  </h2>
                  {teamChannels[selectedTeam]?.find(
                    (c) => c.id === selectedChannel
                  )?.description && (
                    <p className="text-sm text-gray-500">
                      {
                        teamChannels[selectedTeam]?.find(
                          (c) => c.id === selectedChannel
                        )?.description
                      }
                    </p>
                  )}
                </div>
                <div className="flex items-center text-gray-500 space-x-4">
                  <button
                    className="hover:text-[#1e88e5] p-2 rounded-full transition-colors group relative"
                    title="Search messages"
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <span className="absolute top-10 right-0 bg-white text-xs p-1 rounded shadow-lg hidden group-hover:block">
                      Search messages
                    </span>
                  </button>
                  <button
                    className="p-2 rounded-full transition-colors group relative"
                    title="Channel settings"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 group-hover:text-[#ef5350]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                    <div className="absolute right-0 top-10 bg-white rounded shadow-lg p-2 hidden group-hover:block z-20">
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-[#ffebee] hover:text-[#ef5350] rounded transition-colors flex items-center"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to leave this channel?"
                            )
                          ) {
                            console.log(`Leaving channel: ${selectedChannel}`);
                            // Make the leave channel request
                            fetch(
                              `http://localhost:8080/api/channels/${selectedChannel}`,
                              {
                                method: "PUT",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${getAccessToken()}`,
                                },
                              }
                            )
                              .then((response) => {
                                if (response.ok) {
                                  setSelectedChannel(null);
                                }
                              })
                              .catch((err) => {
                                console.error("Error leaving channel:", err);
                              });
                          }
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 3a1 1 0 11-2 0 1 1 0 012 0zm-8.707.293a1 1 0 010 1.414L4.586 9H10a1 1 0 110 2H4.586l.707.707a1 1 0 11-1.414 1.414l-2.5-2.5a1 1 0 010-1.414l2.5-2.5a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Leave Channel
                      </button>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Message area with modern blue gradient background */}
            <div
              className="flex-1 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, #e8f5fd 0%, #bbdefb 50%, #90caf9 100%)`,
              }}
            >
              <ChannelMessages
                channelId={selectedChannel}
                currentUserId={currentUserId}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5]">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
              <div className="w-20 h-20 bg-[#0d47a1] rounded-full flex items-center justify-center text-white mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
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
              </div>
              <h2 className="text-xl font-bold mb-2">Welcome to Team Chat</h2>
              <p className="text-gray-600 mb-6">
                Select a channel from the sidebar to start chatting with your
                team
              </p>
              <div className="text-sm text-gray-500">
                <p>Stay connected with your team from anywhere</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
