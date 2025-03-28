"use client";
import React, { useState, useEffect, useRef } from "react";
import TeamsSidebar from "../chat/components/TeamSidebar";
import ChatArea from "./components/ChatArea";
import ChannelHeader from "../chat/components/ChatHeader";
import { api as axios } from "@/app/lib/api";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAccessToken } from "@/app/lib/auth-utils";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080/ws";
// Define interfaces based on your database schema
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatarUrl?: string;
  status: string;
}

interface UserDisplay {
  id: number;
  name: string;
  avatar?: string;
  status: string;
}

interface Channel {
  id: number;
  teamId: number;
  name: string;
  description?: string;
  isPrivate: boolean;
  unreadCount: number;
}

interface Team {
  id: number;
  name: string;
  icon: string;
  description?: string;
  unreadCount: number;
  channels: Channel[];
}

interface Attachment {
  id: number;
  name: string;
  type: string;
  size: string;
  url: string;
}

interface Reaction {
  emoji: string;
  count: number;
  users: number[];
}

interface Message {
  id: string;
  sender: UserDisplay;
  content: string;
  timestamp: string;
  attachments: Attachment[];
  reactions: Reaction[];
  isRead: boolean;
}

const TeamsChat: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stomp client reference
  const stompClientRef = useRef<Client | null>(null);
  const userChannelsRef = useRef<Set<number>>(new Set());
  const activeSubscriptionsRef = useRef<
    Map<
      string,
      {
        unsubscribe(): unknown;
        id: string;
      }
    >
  >(new Map());

  // Initialize data and socket connection on component mount
  // În locul conexiunii curente, voi face modificări:
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);

        // Fetch current user data
        const userResponse = await axios.get(`${API_BASE_URL}/users/current`);
        setCurrentUser(userResponse.data);
        console.log("[DEBUG] Current User Loaded:", userResponse.data);

        // Fetch all users
        const usersResponse = await axios.get(`${API_BASE_URL}/users`);
        setUsers(usersResponse.data);
        console.log("[DEBUG] Users Loaded:", usersResponse.data);

        // Fetch teams data
        const teamsResponse = await axios.get(`${API_BASE_URL}/teams`);
        const fetchedTeams = teamsResponse.data.map(mapTeamData);
        setTeams(fetchedTeams);
        console.log("[DEBUG] Teams Loaded:", fetchedTeams);

        // Build a set of all channels the user is part of
        const userChannelIds = new Set<number>();
        fetchedTeams.forEach((team: { channels: any[] }) => {
          team.channels.forEach((channel) => {
            userChannelIds.add(channel.id);
          });
        });
        userChannelsRef.current = userChannelIds;
        console.log("[DEBUG] User Channel IDs:", userChannelIds);

        if (fetchedTeams.length > 0) {
          setSelectedTeam(fetchedTeams[0]);

          if (fetchedTeams[0].channels.length > 0) {
            setSelectedChannel(fetchedTeams[0].channels[0]);
          }
        }

        setLoading(false);

        // Initiate WebSocket connection after data load
        initializeWebSocketConnection();
      } catch (err) {
        console.error("[ERROR] Error initializing app:", err);
        setError("Failed to load initial data. Please refresh the page.");
        setLoading(false);
      }
    };

    // 1. Funcția de inițializare WebSocket actualizată
    const initializeWebSocketConnection = () => {
      const token = getAccessToken();
      console.log("[DEBUG] Token for WebSocket:", token);

      if (!token) {
        console.error("[ERROR] No token found for WebSocket connection");
        setError("Authentication token is missing");
        return;
      }

      try {
        // Opțiuni pentru SockJS pentru a dezactiva credentials
        const sockJsOptions = {
          transports: ["websocket", "xhr-streaming", "xhr-polling"],
          withCredentials: false, // Important! Dezactivează credentials pentru a evita probleme CORS
        };

        const socket = new SockJS(SOCKET_URL, null, sockJsOptions);
        console.log("[DEBUG] SockJS Socket created:", socket);

        stompClientRef.current = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          debug: (str) => {
            console.log("[STOMP DEBUG]", str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          // Restul configurației rămâne la fel
        });

        // Activăm conexiunea
        stompClientRef.current.activate();
      } catch (error) {
        console.error("[ERROR] WebSocket initialization failed:", error);
      }
    };

    // 2. Modificarea funcției de autentificare pentru a gestiona UUID-uri
    stompClientRef.current?.publish({
      destination: "/app/authenticate",
      body: JSON.stringify({
        userId: currentUser?.id.toString(), // Asigură-te că este string pentru UUID
      }),
    });

    // 3. Actualizarea funcției joinChannel pentru a gestiona UUID-uri
    const joinChannel = (channelId: string) => {
      if (!stompClientRef.current || !stompClientRef.current.connected) return;

      // Notifică serverul despre alăturarea la canal - asigură-te că trimiți un Integer
      stompClientRef.current.publish({
        destination: "/app/join-channel",
        body: JSON.stringify(parseInt(channelId, 10)), // Asigură-te că este Integer
      });

      // Restul codului rămâne la fel
    };

    // 4. Actualizarea focusChannel pentru a gestiona UUID-uri
    if (
      stompClientRef.current &&
      stompClientRef.current.connected &&
      selectedChannel
    ) {
      stompClientRef.current.publish({
        destination: "/app/focus-channel",
        body: JSON.stringify(selectedChannel.id.toString()), // Asigură-te că este string pentru UUID
      });
    }

    initializeApp();

    // Cleanup function
    return () => {
      if (stompClientRef.current) {
        try {
          console.log("[DEBUG] Deactivating STOMP client");
          stompClientRef.current.deactivate();
        } catch (deactivationError) {
          console.error(
            "[ERROR] Failed to deactivate STOMP client:",
            deactivationError
          );
        }
      }
    };
  }, []); // Dependențe goale pentru a rula o singură dată la mount

  // Connect to STOMP after user data is loaded
  useEffect(() => {
    if (!currentUser || !stompClientRef.current) return;

    // Obține token-ul JWT din localStorage (sau de unde îl stochezi)
    const token = getAccessToken(); // Ajustează pentru a se potrivi cu locația reală a token-ului

    // Setează header-ul de autorizare pentru toate conexiunile
    if (token) {
      stompClientRef.current.connectHeaders = {
        Authorization: `Bearer ${token}`,
      };
    }

    // Set up connection activation
    stompClientRef.current.onConnect = () => {
      console.log("Connected to STOMP WebSocket");

      // Authenticate user - păstrăm pentru compatibilitate
      stompClientRef.current?.publish({
        destination: "/app/authenticate",
        body: JSON.stringify({ userId: currentUser.id }),
      });

      // Subscribe to user status updates
      const statusSubscription = stompClientRef.current?.subscribe(
        "/topic/user-status",
        (message) => {
          const statusData = JSON.parse(message.body);
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === statusData.userId
                ? { ...user, status: statusData.status }
                : user
            )
          );
        }
      );

      if (statusSubscription) {
        activeSubscriptionsRef.current.set("user-status", statusSubscription);
      }

      // Join all user channels
      userChannelsRef.current.forEach((channelId) => {
        joinChannel(channelId);
      });
    };

    stompClientRef.current.onDisconnect = () => {
      console.log("Disconnected from STOMP WebSocket");
    };

    stompClientRef.current.onStompError = (frame) => {
      console.error("STOMP error", frame);
      setError(`WebSocket error: ${frame.headers.message}`);
    };

    // Activate connection
    stompClientRef.current.activate();
  }, [currentUser]);

  // Function to join a channel
  const joinChannel = (channelId: number) => {
    if (!stompClientRef.current || !stompClientRef.current.connected) return;

    // Notify server about joining the channel
    stompClientRef.current.publish({
      destination: "/app/join-channel",
      body: JSON.stringify(channelId),
    });

    // Subscribe to channel messages
    const channelTopic = `/topic/channel/${channelId}`;
    if (!activeSubscriptionsRef.current.has(channelTopic)) {
      const subscription = stompClientRef.current.subscribe(
        channelTopic,
        (message) => {
          const data = JSON.parse(message.body);

          // Check message type based on properties
          if (data.messageId && data.reactionType) {
            // This is a reaction update
            handleReactionUpdate(data);
          } else if (data.channelId && data.content) {
            // This is a new message
            handleNewMessage(data);
          }
        }
      );

      activeSubscriptionsRef.current.set(channelTopic, subscription);
    }

    // Subscribe to typing indicators
    const typingTopic = `/topic/channel/${channelId}/typing`;
    if (!activeSubscriptionsRef.current.has(typingTopic)) {
      const subscription = stompClientRef.current.subscribe(
        typingTopic,
        (message) => {
          // Handle typing indicators if needed
          // const typingData = JSON.parse(message.body);
          // Could update a state to show typing indicators
        }
      );

      activeSubscriptionsRef.current.set(typingTopic, subscription);
    }
  };

  // Function to leave a channel
  const leaveChannel = (channelId: number) => {
    if (!stompClientRef.current || !stompClientRef.current.connected) return;

    // Notify server about leaving the channel
    stompClientRef.current.publish({
      destination: "/app/leave-channel",
      body: JSON.stringify(channelId),
    });

    // Unsubscribe from channel topics
    const channelTopic = `/topic/channel/${channelId}`;
    if (activeSubscriptionsRef.current.has(channelTopic)) {
      const subscription = activeSubscriptionsRef.current.get(channelTopic);
      if (subscription) {
        subscription.unsubscribe();
        activeSubscriptionsRef.current.delete(channelTopic);
      }
    }

    const typingTopic = `/topic/channel/${channelId}/typing`;
    if (activeSubscriptionsRef.current.has(typingTopic)) {
      const subscription = activeSubscriptionsRef.current.get(typingTopic);
      if (subscription) {
        subscription.unsubscribe();
        activeSubscriptionsRef.current.delete(typingTopic);
      }
    }
  };

  // Handler for new messages from WebSocket
  const handleNewMessage = (messageData: any) => {
    // If message belongs to one of the user's channels
    if (userChannelsRef.current.has(messageData.channelId)) {
      // If it's for the currently selected channel, add it to messages
      if (selectedChannel && messageData.channelId === selectedChannel.id) {
        const newMessage = mapMessageToDisplay(messageData);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
      // Otherwise, update the unread count for that channel
      else {
        // Find which team this channel belongs to
        for (const team of teams) {
          const channel = team.channels.find(
            (c) => c.id === messageData.channelId
          );
          if (channel) {
            updateUnreadCount(team.id, channel.id, 1);
            break;
          }
        }
      }
    }
  };

  // Handler for reaction updates from WebSocket
  const handleReactionUpdate = (reactionData: any) => {
    if (selectedChannel && reactionData.channelId === selectedChannel.id) {
      updateMessageReaction(
        reactionData.messageId.toString(),
        reactionData.reactionType,
        reactionData.userId,
        reactionData.action === "add"
      );
    }
  };

  // Join all user channels via STOMP
  useEffect(() => {
    if (
      !stompClientRef.current ||
      !stompClientRef.current.connected ||
      !currentUser
    )
      return;

    // Join all user channels
    userChannelsRef.current.forEach((channelId) => {
      joinChannel(channelId);
    });

    return () => {
      // Leave all channels when unmounting
      userChannelsRef.current.forEach((channelId) => {
        leaveChannel(channelId);
      });
    };
  }, [currentUser]);

  // Fetch messages when channel changes
  useEffect(() => {
    if (!selectedChannel) return;

    const fetchMessages = async () => {
      try {
        const messagesResponse = await axios.get(
          `${API_BASE_URL}/channels/${selectedChannel.id}/messages`
        );
        const messageDisplays = messagesResponse.data.map((msg: any) =>
          mapMessageToDisplay(msg)
        );
        setMessages(messageDisplays);

        // Mark channel as read
        axios
          .post(`${API_BASE_URL}/channels/${selectedChannel.id}/read`)
          .then(() => {
            // Update unread count to 0 for this channel
            updateUnreadCount(selectedTeam!.id, selectedChannel.id, 0, true);
          })
          .catch((err) => console.error("Error marking channel as read:", err));
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages. Please try again.");
      }
    };

    fetchMessages();

    // Tell the server we're focused on this channel
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: "/app/focus-channel",
        body: JSON.stringify(selectedChannel.id),
      });
    }

    return () => {
      // Tell the server we're no longer focused on this channel
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.publish({
          destination: "/app/unfocus-channel",
          body: JSON.stringify(selectedChannel.id),
        });
      }
    };
  }, [selectedChannel]);

  // Helper function to map backend team data to frontend format
  const mapTeamData = (team: any): Team => {
    return {
      id: team.id,
      name: team.name,
      icon: team.icon_url || "📊", // Default icon if none is provided
      description: team.description,
      unreadCount: team.unreadCount || 0,
      channels: team.channels.map((channel: any) => ({
        id: channel.id,
        teamId: team.id,
        name: channel.name,
        description: channel.description,
        isPrivate: channel.is_private,
        unreadCount: channel.unreadCount || 0,
      })),
    };
  };

  // Helper function to map backend message data to frontend display format
  const mapMessageToDisplay = (message: any): Message => {
    const senderUser = users.find((user) => user.id === message.senderId);

    const sender: UserDisplay = senderUser
      ? {
          id: senderUser.id,
          name: `${senderUser.firstName} ${senderUser.lastName}`,
          avatar: senderUser.avatarUrl,
          status: senderUser.status || "offline",
        }
      : {
          id: message.senderId,
          name: "Unknown User",
          status: "offline",
        };

    // Map attachments
    const mappedAttachments = message.attachments
      ? message.attachments.map((attach: any) => ({
          id: attach.id,
          name: attach.fileName,
          type: attach.fileType,
          size: formatFileSize(attach.fileSize),
          url: attach.url,
        }))
      : [];

    // Map reactions - group by emoji
    const reactionMap = new Map<string, { count: number; users: number[] }>();

    if (message.reactions) {
      message.reactions.forEach((reaction: any) => {
        const existingReaction = reactionMap.get(reaction.reactionType);
        if (existingReaction) {
          existingReaction.count++;
          existingReaction.users.push(reaction.userId);
        } else {
          reactionMap.set(reaction.reactionType, {
            count: 1,
            users: [reaction.userId],
          });
        }
      });
    }

    const mappedReactions = Array.from(reactionMap.entries()).map(
      ([emoji, data]) => ({
        emoji,
        count: data.count,
        users: data.users,
      })
    );

    return {
      id: message.id.toString(),
      sender,
      content: message.content,
      timestamp: message.createdAt || message.created_at,
      attachments: mappedAttachments,
      reactions: mappedReactions,
      isRead: message.isRead || false,
    };
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Update unread counts in state
  const updateUnreadCount = (
    teamId: number,
    channelId: number,
    count: number,
    setToExact: boolean = false
  ) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id === teamId) {
          const updatedChannels = team.channels.map((channel) => {
            if (channel.id === channelId) {
              return {
                ...channel,
                unreadCount: setToExact ? count : channel.unreadCount + count,
              };
            }
            return channel;
          });

          // Calculate team unread count as sum of all channels
          const teamUnreadCount = updatedChannels.reduce(
            (sum, channel) => sum + channel.unreadCount,
            0
          );

          return {
            ...team,
            channels: updatedChannels,
            unreadCount: teamUnreadCount,
          };
        }
        return team;
      })
    );
  };

  // Update message reactions in the UI
  const updateMessageReaction = (
    messageId: string,
    emoji: string,
    userId: number,
    isAdding: boolean
  ) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) => {
        if (message.id === messageId) {
          const existingReactionIndex = message.reactions.findIndex(
            (r) => r.emoji === emoji
          );

          if (existingReactionIndex > -1) {
            const existingReaction = message.reactions[existingReactionIndex];

            if (isAdding) {
              // Check if user already reacted
              if (existingReaction.users.includes(userId)) {
                return message;
              }

              // Add user to existing reaction
              const updatedReactions = [...message.reactions];
              updatedReactions[existingReactionIndex] = {
                ...existingReaction,
                users: [...existingReaction.users, userId],
                count: existingReaction.count + 1,
              };
              return { ...message, reactions: updatedReactions };
            } else {
              // Remove user from reaction
              const updatedUsers = existingReaction.users.filter(
                (id) => id !== userId
              );

              if (updatedUsers.length === 0) {
                // Remove the reaction completely if no users left
                return {
                  ...message,
                  reactions: message.reactions.filter(
                    (_, i) => i !== existingReactionIndex
                  ),
                };
              } else {
                // Update the users list and count
                const updatedReactions = [...message.reactions];
                updatedReactions[existingReactionIndex] = {
                  ...existingReaction,
                  users: updatedUsers,
                  count: updatedUsers.length,
                };
                return { ...message, reactions: updatedReactions };
              }
            }
          } else if (isAdding) {
            // Add new reaction
            return {
              ...message,
              reactions: [
                ...message.reactions,
                { emoji, count: 1, users: [userId] },
              ],
            };
          }
        }
        return message;
      })
    );
  };

  const handleTeamSelect = (teamId: number) => {
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

  const handleChannelSelect = (channelId: number) => {
    if (!selectedTeam) return;

    const channel = selectedTeam.channels.find((c) => c.id === channelId);
    if (channel) {
      setSelectedChannel(channel);
    }
  };

  const handleSendMessage = async (
    content: string,
    attachments: any[] = []
  ) => {
    if (!selectedChannel || !currentUser || !stompClientRef.current) return;

    try {
      // Prepare message data
      const messageData = {
        channelId: selectedChannel.id,
        senderId: currentUser.id,
        content,
      };

      // First, send via REST to get the ID and for storage
      const response = await axios.post(
        `${API_BASE_URL}/messages`,
        messageData
      );
      const newMessageId = response.data.id;

      // If there are attachments, link them to the message
      if (attachments.length > 0) {
        for (const attachment of attachments) {
          await axios.post(
            `${API_BASE_URL}/messages/${newMessageId}/attachments`,
            {
              attachment_id: attachment.id,
            }
          );
        }
      }

      // Now send via STOMP for real-time delivery
      // The STOMP message will trigger a broadcast to all connected clients
      if (stompClientRef.current.connected) {
        // Get the complete message with attachments if any were added
        let completeMessage = response.data;
        if (attachments.length > 0) {
          const messageResponse = await axios.get(
            `${API_BASE_URL}/messages/${newMessageId}`
          );
          completeMessage = messageResponse.data;
        }

        stompClientRef.current.publish({
          destination: "/app/send-message",
          body: JSON.stringify(completeMessage),
        });
      } else {
        // Fallback if STOMP is not connected
        const messageResponse = await axios.get(
          `${API_BASE_URL}/messages/${newMessageId}`
        );
        const mappedMessage = mapMessageToDisplay(messageResponse.data);
        setMessages((prevMessages) => [...prevMessages, mappedMessage]);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!currentUser || !stompClientRef.current || !selectedChannel) return;

    try {
      // Check if the user already has this reaction
      const message = messages.find((m) => m.id === messageId);
      const existingReaction = message?.reactions.find(
        (r) => r.emoji === emoji
      );
      const userHasReaction = existingReaction?.users.includes(currentUser.id);
      const action = userHasReaction ? "remove" : "add";

      // Send reaction data via REST
      if (action === "remove") {
        await axios.delete(`${API_BASE_URL}/messages/${messageId}/reactions`, {
          data: {
            user_id: currentUser.id,
            reaction_type: emoji,
          },
        });
      } else {
        await axios.post(`${API_BASE_URL}/messages/${messageId}/reactions`, {
          user_id: currentUser.id,
          reaction_type: emoji,
        });
      }

      // Send reaction update via STOMP
      if (stompClientRef.current.connected) {
        const reactionData = {
          messageId: parseInt(messageId),
          userId: currentUser.id,
          channelId: selectedChannel.id,
          reactionType: emoji,
          action: action,
        };

        stompClientRef.current.publish({
          destination: "/app/message-reaction",
          body: JSON.stringify(reactionData),
        });
      } else {
        // Fallback if STOMP is not connected
        updateMessageReaction(
          messageId,
          emoji,
          currentUser.id,
          action === "add"
        );
      }
    } catch (err) {
      console.error("Error handling reaction:", err);
      setError("Failed to update reaction. Please try again.");
    }
  };

  // Handle file upload for attachments
  const handleFileUpload = async (file: File) => {
    if (!selectedChannel || !currentUser) return null;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("channel_id", selectedChannel.id.toString());
      formData.append("uploaded_by", currentUser.id.toString());

      const response = await axios.post(
        `${API_BASE_URL}/files/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return {
        id: response.data.id,
        name: response.data.fileName,
        type: response.data.fileType,
        size: formatFileSize(response.data.fileSize),
        url: response.data.url,
      };
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Failed to upload file. Please try again.");
      return null;
    }
  };

  // Send typing indicator
  const sendTypingIndicator = (isTyping: boolean) => {
    if (
      !stompClientRef.current ||
      !stompClientRef.current.connected ||
      !currentUser ||
      !selectedChannel
    )
      return;

    const typingData = {
      userId: currentUser.id,
      channelId: selectedChannel.id,
      isTyping,
    };

    stompClientRef.current.publish({
      destination: "/app/typing-indicator",
      body: JSON.stringify(typingData),
    });
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
      {/* Mobile hamburger menu */}
      <div className="md:hidden absolute left-4 top-4 z-10">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          isMobileSidebarOpen ? "block" : "hidden"
        } md:block md:w-64 bg-gray-100 border-r border-gray-200`}
      >
        <TeamsSidebar
          teams={teams}
          selectedTeam={selectedTeam}
          selectedChannel={selectedChannel}
          onTeamSelect={handleTeamSelect}
          onChannelSelect={handleChannelSelect}
          onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {selectedChannel && selectedTeam && (
          <>
            <ChannelHeader
              team={selectedTeam}
              channel={selectedChannel}
              onlineUsers={
                users.filter((user) => user.status === "online").length
              }
              totalUsers={users.length}
            />

            <ChatArea
              messages={messages}
              currentUser={currentUser as any}
              users={users}
              onSendMessage={handleSendMessage}
              onReaction={handleReaction}
              onFileUpload={handleFileUpload}
              onTyping={sendTypingIndicator}
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
