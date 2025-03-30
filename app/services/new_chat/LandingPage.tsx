"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import ChannelMessages from "./components/ChannelMessages";
import { getAccessToken } from "@/app/lib/auth-utils";
import { Team, Channel } from "./components/interface";

function debounce<F extends (...args: any[]) => any>(func: F, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<F>) {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

const ChatPage = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamChannels, setTeamChannels] = useState<Record<string, Channel[]>>(
    {}
  );
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>(
    {}
  );

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

      // Initialize expanded state for all teams
      const initialExpandedState: Record<string, boolean> = {};
      data.forEach((team) => {
        initialExpandedState[team.id] = false;
      });

      // Auto-select the first team if none is selected
      if (data.length > 0 && !selectedTeamRef.current) {
        const firstTeamId = data[0].id;
        console.log(`Auto-selecting first team: ${firstTeamId}`);

        setSelectedTeam(firstTeamId);
        selectedTeamRef.current = firstTeamId;

        initialExpandedState[firstTeamId] = true;
      }

      setExpandedTeams(initialExpandedState);
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
  }, []); // No dependencies to prevent recreation

  // Debounced version of fetchTeamChannels to prevent rapid calls
  const debouncedFetchChannels = useCallback(
    debounce((teamId: string) => {
      if (teamId) fetchTeamChannels(teamId);
    }, 300),
    [fetchTeamChannels]
  );

  // Initial load of teams
  useEffect(() => {
    console.log("Initial teams load effect running");
    fetchTeams();
  }, []); // Empty dependency array - run once on mount

  // Load channels when team changes
  useEffect(() => {
    if (selectedTeam) {
      console.log(`Team selection changed to: ${selectedTeam}`);
      debouncedFetchChannels(selectedTeam);
    }
  }, [selectedTeam, debouncedFetchChannels]);

  // Toggle team expansion with stable reference
  const toggleTeamExpansion = useCallback((teamId: string) => {
    console.log(`Toggling expansion for team: ${teamId}`);

    setExpandedTeams((prev) => {
      const isCurrentlyExpanded = prev[teamId];
      return {
        ...prev,
        [teamId]: !isCurrentlyExpanded,
      };
    });

    // If team is being expanded and it's not the currently selected team, select it
    setExpandedTeams((prev) => {
      if (!prev[teamId] && selectedTeamRef.current !== teamId) {
        console.log(`Selecting team on expansion: ${teamId}`);
        setSelectedTeam(teamId);
        selectedTeamRef.current = teamId;
      }
      return prev;
    });
  }, []);

  // Handle channel selection with stable reference
  const handleChannelSelect = useCallback((channelId: string) => {
    console.log(`Channel selected: ${channelId}`);
    setSelectedChannel(channelId);
    selectedChannelRef.current = channelId;
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Teams and Channels */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="font-bold text-xl">Team Chat</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Teams List */}
          <div className="p-3">
            <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-2">
              Your Teams
            </h2>
            <ul className="space-y-1">
              {teams.map((team) => (
                <li key={team.id}>
                  {/* Team header with toggle */}
                  <button
                    className={`w-full text-left py-2 px-3 rounded flex items-center justify-between ${
                      selectedTeam === team.id
                        ? "bg-gray-700 text-white"
                        : "hover:bg-gray-700"
                    }`}
                    onClick={() => toggleTeamExpansion(team.id)}
                  >
                    <span className="flex items-center">
                      {team.icon && <span className="mr-2">{team.icon}</span>}
                      <span>{team.name}</span>
                      {team.unreadCount > 0 && (
                        <span className="ml-2 bg-red-500 rounded-full px-2 py-0.5 text-xs">
                          {team.unreadCount}
                        </span>
                      )}
                    </span>
                    <span className="text-xs">
                      {expandedTeams[team.id] ? "▼" : "▶"}
                    </span>
                  </button>

                  {/* Channels for this team */}
                  {expandedTeams[team.id] && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {teamChannels[team.id]?.length > 0 ? (
                        teamChannels[team.id].map((channel) => (
                          <li key={channel.id}>
                            <button
                              className={`w-full text-left py-1 px-3 rounded text-sm ${
                                selectedChannel === channel.id
                                  ? "bg-blue-500 text-white"
                                  : "hover:bg-gray-600 text-gray-300"
                              }`}
                              onClick={() => handleChannelSelect(channel.id)}
                            >
                              <span className="flex items-center justify-between">
                                <span>
                                  {channel.isPrivate ? "🔒" : "#"}{" "}
                                  {channel.name}
                                </span>
                                {channel.unreadCount > 0 && (
                                  <span className="bg-red-500 rounded-full px-2 py-0.5 text-xs">
                                    {channel.unreadCount}
                                  </span>
                                )}
                              </span>
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 text-xs px-3 py-1">
                          No channels available
                        </li>
                      )}
                    </ul>
                  )}
                </li>
              ))}

              {teams.length === 0 && (
                <li className="text-gray-500 text-sm px-3 py-2">
                  No teams available
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* User profile */}
        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-500 mr-3"></div>
            <div>
              <div className="font-medium">Current User</div>
              <div className="text-xs text-gray-400">Online</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content - Messages */}
      <div className="flex-1 flex flex-col">
        {selectedChannel && currentChannel ? (
          <>
            {/* Channel header */}
            <div className="bg-white border-b p-3 flex items-center">
              <div className="flex-1">
                <h2 className="font-semibold flex items-center">
                  <span className="text-gray-500 mr-2">
                    {currentTeam?.name} /
                  </span>
                  <span>
                    {currentChannel.isPrivate ? "🔒" : "#"}{" "}
                    {currentChannel.name}
                  </span>
                </h2>
                {currentChannel.description && (
                  <p className="text-sm text-gray-500">
                    {currentChannel.description}
                  </p>
                )}
              </div>
            </div>

            {/* Message area */}
            <div className="flex-1 overflow-hidden">
              {selectedChannel && (
                <ChannelMessages
                  channelId={selectedChannel}
                  currentUserId={currentUserId}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {teams.length > 0
              ? "Select a channel to start messaging"
              : "No teams available. Please create or join a team."}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
