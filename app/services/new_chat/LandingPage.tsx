"use client";
import React, { useState, useEffect, useRef } from "react";
import TeamsSidebar from "../chat/components/TeamSidebar";
import ChatArea from "./components/ChatArea";
import ChannelHeader from "../chat/components/ChatHeader";
import { api as axios } from "@/app/lib/api";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAccessToken } from "@/app/lib/auth-utils";
import Team from "@/app/types/models_types/team";
import { UserTeam as User } from "@/app/types/models_types/userType";
import Channel from "@/app/types/models_types/channel";

interface Message {
  id: string;
  sender: {
    id: number;
    name: string;
    avatar?: string;
    status: string;
  };
  content: string;
  timestamp: string;
  attachments: any[];
  reactions: any[];
  isRead: boolean;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080/ws";

const TeamsChat: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User>({} as User);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);

        // ----resolved
        const userResponse = await axios.get(`/api/users/current`);
        setCurrentUser(userResponse.data);

        //----resolved
        const response = await axios.get(`$/api/users/team-mates`);
        setUsers(response.data);

        const teamsResponse = await axios.get(`/api/teams`);

        // ----resolved ??
        const teamsWithChannels = await Promise.all(
          teamsResponse.data.map(async (team: any) => {
            const channelsResponse = await axios.get(
              `/api/teams/${team.id}/channels`
            );

            return {
              id: team.id,
              name: team.name,
              icon: team.icon_url || "📊",
              description: team.description,
              unreadCount: team.unreadCount || 0,
              channels: channelsResponse.data.map((channel: any) => ({
                id: channel.id,
                teamId: team.id,
                name: channel.name,
                description: channel.description,
                isPrivate: channel.is_private,
                unreadCount: channel.unreadCount || 0,
              })),
            };
          })
        );

        setTeams(teamsWithChannels);

        if (teamsWithChannels.length > 0) {
          setSelectedTeam(teamsWithChannels[0]);
          if (teamsWithChannels[0].channels.length > 0) {
            setSelectedChannel(teamsWithChannels[0].channels[0]);
          }
        }

        setLoading(false);
        initializeWebSocketConnection();
      } catch (err) {
        console.error("Error initializing app:", err);
        setError("Failed to load initial data. Please refresh the page.");
        setLoading(false);
      }
    };

    const initializeWebSocketConnection = () => {
      const token = getAccessToken();
      if (!token) {
        console.error("No token found for WebSocket connection");
        setError("Authentication token is missing");
        return;
      }

      const socket = new SockJS(SOCKET_URL);
      stompClientRef.current = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => console.log(str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      stompClientRef.current.onConnect = () => {
        console.log("Connected to WebSocket");
        subscribeToChannels();
      };

      stompClientRef.current.onStompError = (frame) => {
        console.error("STOMP error", frame);
        setError(`WebSocket error: ${frame.headers.message}`);
      };

      stompClientRef.current.activate();
    };

    const subscribeToChannels = () => {
      if (!stompClientRef.current?.connected) return;

      teams.forEach((team) => {
        team.channels.forEach((channel) => {
          const topic = `/topic/channel/${channel.id}`;
          stompClientRef.current?.subscribe(topic, (message) => {
            const newMessage = JSON.parse(message.body);
            setMessages((prev) => [
              ...prev,
              {
                id: newMessage.id.toString(),
                sender: {
                  id: newMessage.senderId,
                  name:
                    users.find((u) => u.id === newMessage.senderId)?.firstName +
                      " " +
                      users.find((u) => u.id === newMessage.senderId)
                        ?.lastName || "Unknown",
                  status: "online",
                },
                content: newMessage.content,
                timestamp: newMessage.createdAt,
                attachments: [],
                reactions: [],
                isRead: true,
              },
            ]);
          });
        });
      });
    };

    initializeApp();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedChannel) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/channels/${selectedChannel.id}/messages`
        );
        const messageDisplays = response.data.map((msg: any) => ({
          id: msg.id.toString(),
          sender: {
            id: msg.senderId,
            name:
              users.find((u) => u.id === msg.senderId)?.firstName +
                " " +
                users.find((u) => u.id === msg.senderId)?.lastName || "Unknown",
            status: "online",
          },
          content: msg.content,
          timestamp: msg.createdAt,
          attachments: [],
          reactions: [],
          isRead: true,
        }));
        setMessages(messageDisplays);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages. Please try again.");
      }
    };

    fetchMessages();
  }, [selectedChannel, users]);

  const handleTeamSelect = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (team) {
      setSelectedTeam(team);
      if (team.channels.length > 0) {
        setSelectedChannel(team.channels[0]);
      } else {
        setSelectedChannel(null);
        setMessages([]);
      }
    }
  };

  const handleChannelSelect = (channelId: string) => {
    if (!selectedTeam) return;
    const channel = selectedTeam.channels.find((c) => c.id === channelId);
    if (channel) setSelectedChannel(channel);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChannel || !currentUser || !stompClientRef.current) return;

    try {
      const messageData = {
        channelId: selectedChannel.id,
        senderId: currentUser.id,
        content,
      };

      // Send via STOMP for real-time delivery
      stompClientRef.current.publish({
        destination: "/app/send-message",
        body: JSON.stringify(messageData),
      });

      // Also store via REST
      await axios.post(`${API_BASE_URL}/messages`, messageData);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 border-r border-gray-200">
        <TeamsSidebar
          teams={teams}
          selectedTeam={selectedTeam}
          selectedChannel={selectedChannel}
          onTeamSelect={handleTeamSelect}
          onChannelSelect={handleChannelSelect}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {selectedChannel && selectedTeam && (
          <>
            <ChannelHeader
              team={selectedTeam}
              channel={selectedChannel}
              onlineUsers={users.filter((u) => u.status === "online").length}
              totalUsers={users.length}
            />

            <ChatArea
              messages={messages}
              currentUser={currentUser}
              users={users}
              onSendMessage={handleSendMessage}
              onReaction={() => {}} // Simplified - no reactions in this version
              onFileUpload={() => Promise.resolve(null)} // Simplified - no file uploads
              teamName={selectedTeam.name}
              channelName={selectedChannel.name}
            />
          </>
        )}

        {(!selectedChannel || !selectedTeam) && (
          <div className="flex items-center justify-center h-full">
            Please select a channel to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsChat;
