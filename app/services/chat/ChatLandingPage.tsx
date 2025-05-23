"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import TeamsSidebar from "./components/TeamSidebar";
import ChatArea from "./components/ChatArea";
import ChannelHeader from "./components/ChatHeader";
import { api as axios } from "@/app/lib/api";
import { Client, IFrame } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { io, Socket } from "socket.io-client";
import {
  getPrivateChats,
  createPrivateChat,
  getPrivateChatMessages,
  sendPrivateMessage,
} from "../../lib/api";
import { UserTeam } from "../../types/models_types/userType";

// Define API URL base
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080/ws";

// Define interfaces based on your database schema
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatarUrl?: string;
  status: string;
}

interface UserDisplay {
  id: string;
  name: string;
  avatar?: string;
  status: string;
}

interface Channel {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  unreadCount: number;
}

interface Team {
  id: string;
  name: string;
  icon: string;
  description?: string;
  unreadCount: number;
  channels: Channel[];
}

interface Attachment {
  id: string;
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
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    status: string;
  };
  timestamp: string;
  attachments: any[];
  reactions: any[];
  isRead: boolean;
}

interface PrivateChat {
  id: string;
  participants: UserDisplay[];
  unreadCount: number;
  lastMessage?: Message;
}

interface PrivateChatResponse {
  id: string;
  participants: UserDisplay[];
}

interface WebSocketMessage {
  chatId: string;
  message: Message;
}

interface WebSocketMessagesResponse {
  chatId: string;
  messages: Message[];
}

const TeamsChat: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<UserTeam | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [privateChats, setPrivateChats] = useState<PrivateChat[]>([]);
  const [selectedPrivateChat, setSelectedPrivateChat] =
    useState<PrivateChat | null>(null);
  const [showUserList, setShowUserList] = useState(false);

  // Stomp client reference
  const stompClientRef = useRef<Client | null>(null);
  const userChannelsRef = useRef<Set<number>>(new Set());
  const activeSubscriptionsRef = useRef<
    Map<
      string,
      {
        [x: string]: any;
        id: string;
      }
    >
  >(new Map());

  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize data and socket connection on component mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);

        // Fetch current user data
        const userResponse = await axios.get(`${API_BASE_URL}/users/current`);
        setCurrentUser(userResponse.data);

        // Fetch all users
        try {
          const usersResponse = await axios.get(`${API_BASE_URL}/users`);
          console.log("Users fetched:", usersResponse.data);
          setUsers(usersResponse.data);
        } catch (error) {
          console.error("Error fetching users:", error);
          // Set empty array if users can't be fetched
          setUsers([]);
        }

        // Fetch teams data
        const teamsResponse = await axios.get(`${API_BASE_URL}/teams`);
        console.log("Raw teams data:", teamsResponse.data);
        const fetchedTeams = Array.isArray(teamsResponse.data)
          ? teamsResponse.data.map(mapTeamData)
          : [];

        console.log("Mapped teams: ", fetchedTeams);

        setTeams(fetchedTeams);

        // Build a set of all channels the user is part of
        const userChannelIds = new Set<number>();
        fetchedTeams.forEach((team: { channels: any[] }) => {
          team.channels.forEach((channel) => {
            userChannelIds.add(channel.id);
          });
        });
        userChannelsRef.current = userChannelIds;

        if (fetchedTeams.length > 0) {
          setSelectedTeam(fetchedTeams[0]);

          if (fetchedTeams[0].channels.length > 0) {
            setSelectedChannel(fetchedTeams[0].channels[0]);
          }
        }

        // Initialize WebSocket connection
        const newSocket = io(
          process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001",
          {
            path: "/ws",
            auth: {
              token: localStorage.getItem("token"),
            },
          }
        );

        newSocket.on("connect", () => {
          console.log("Connected to WebSocket server");
        });

        newSocket.on("new-private-message", (data: WebSocketMessage) =>
          handleNewPrivateMessage(data)
        );
        newSocket.on("private-messages", (data: WebSocketMessagesResponse) => {
          if (data.chatId === selectedPrivateChat?.id) {
            setMessages(data.messages);
          }
        });

        setSocket(newSocket);

        // Initialize WebSocket connection
        const socket = new SockJS(SOCKET_URL);
        const stompClient = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          debug: function (str) {
            console.log(str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        stompClient.onConnect = () => {
          console.log("Connected to WebSocket");

          // Subscribe to private chat events
          users.forEach((user) => {
            if (user.id !== currentUser?.id) {
              const chatId = [currentUser?.id, user.id].sort().join("-");
              stompClient.subscribe(`/private/${chatId}`, (message) => {
                const data = JSON.parse(message.body);
                handleNewPrivateMessage(data);
              });
            }
          });
        };

        stompClient.activate();
        stompClientRef.current = stompClient;
      } catch (error) {
        console.error("Error initializing app:", error);
        setError("Failed to initialize chat application");
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Connect to STOMP after user data is loaded
  useEffect(() => {
    if (!currentUser || !stompClientRef.current) return;

    // Set up connection activation
    stompClientRef.current.onConnect = () => {
      console.log("Connected to STOMP WebSocket");

      // Authenticate user
      stompClientRef.current?.publish({
        destination: "/app/authenticate",
        body: JSON.stringify({ userId: currentUser.id }),
      });

      // Subscribe to user status updates
      const statusSubscription = stompClientRef.current?.subscribe(
        "/topic/user-status",
        (message: { body: string }) => {
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

    stompClientRef.current.onStompError = (frame: IFrame) => {
      console.error("STOMP error", frame);
      setError(`WebSocket error: ${frame.headers.message || "Unknown error"}`);
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
        (message: { body: string }) => {
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
      const subscription = stompClientRef.current.subscribe(typingTopic, () => {
        // Handle typing indicators if needed
        // const typingData = JSON.parse(message.body);
        // Could update a state to show typing indicators
      });

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

  const mapTeamData = (team: any): Team => {
    return {
      id: team.id,
      name: team.name,
      icon: team.icon_url || "📊",
      description: team.description,
      unreadCount: team.unreadCount || 0,
      channels: Array.isArray(team.channels)
        ? team.channels.map((channel: any) => ({
            id: channel.id,
            teamId: team.id,
            name: channel.name,
            description: channel.description,
            isPrivate: channel.is_private,
            unreadCount: channel.unreadCount || 0,
          }))
        : [],
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
          status: senderUser.status || "OFFLINE",
        }
      : {
          id: message.senderId,
          name: "Unknown User",
          status: "OFFLINE",
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
    teamId: string,
    channelId: string,
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

  const handleNewPrivateMessage = useCallback(
    (data: WebSocketMessage) => {
      setPrivateChats((prevChats) => {
        const updatedChats = [...prevChats];
        const chatIndex = updatedChats.findIndex(
          (chat) => chat.id === data.chatId
        );

        if (chatIndex !== -1) {
          // Update existing chat
          const updatedChat = {
            ...updatedChats[chatIndex],
            lastMessage: data.message,
            unreadCount:
              selectedPrivateChat?.id === data.chatId
                ? 0
                : updatedChats[chatIndex].unreadCount + 1,
          };
          updatedChats[chatIndex] = updatedChat;
        }

        return updatedChats;
      });

      if (selectedPrivateChat?.id === data.chatId) {
        setMessages((prev) => [...prev, data.message]);
      }
    },
    [selectedPrivateChat]
  );

  // Function to fetch users by team ID
  const fetchUsersByTeam = async (teamId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teams/${teamId}/users`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching users for team ${teamId}:`, error);
      return [];
    }
  };

  // Function to start a private chat with a user
  const startPrivateChat = async (userId: string) => {
    try {
      const response = (await createPrivateChat({
        targetUserId: userId,
      })) as PrivateChatResponse;
      console.log("Private chat created:", response);

      // Add the new chat to the list
      const newChat: PrivateChat = {
        id: response.id,
        participants: response.participants,
        unreadCount: 0,
      };

      setPrivateChats((prevChats) => [...prevChats, newChat]);
      setSelectedPrivateChat(newChat);
      setShowUserList(false);

      // Join WebSocket room for the new chat
      socket?.emit("join-private-chat", { chatId: newChat.id });
    } catch (error) {
      console.error("Error creating private chat:", error);
      setError("Failed to create private chat. Please try again.");
    }
  };

  const handleSendPrivateMessage = useCallback(
    async (content: string, attachments: any[] = []) => {
      if (!selectedPrivateChat || !currentUser) return;

      try {
        // Optimistic update
        const tempMessage: Message = {
          id: `temp-${Date.now()}`,
          content,
          sender: {
            id: currentUser.id,
            name: `${currentUser.firstName} ${currentUser.lastName}`,
            avatar: currentUser.profileImage || undefined,
            status: currentUser.status || "offline",
          },
          timestamp: new Date().toISOString(),
          attachments,
          reactions: [],
          isRead: true,
        };

        setPrivateChats((prevChats) => {
          const updatedChats = [...prevChats];
          const chatIndex = updatedChats.findIndex(
            (chat) => chat.id === selectedPrivateChat.id
          );

          if (chatIndex !== -1) {
            updatedChats[chatIndex] = {
              ...updatedChats[chatIndex],
              lastMessage: tempMessage,
              unreadCount: 0,
            };
          }

          return updatedChats;
        });

        setMessages((prev) => [...prev, tempMessage]);

        // Send message through WebSocket
        socket?.emit("private-message", {
          chatId: selectedPrivateChat.id,
          message: {
            content,
            attachments,
          },
        });
      } catch (error) {
        console.error("Error sending private message:", error);
        setError("Failed to send message");
      }
    },
    [selectedPrivateChat, currentUser, socket]
  );

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
    <div className="flex h-screen bg-gray-100">
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
          privateChats={privateChats}
          selectedPrivateChat={selectedPrivateChat}
          onPrivateChatSelect={setSelectedPrivateChat}
          onStartPrivateChat={startPrivateChat}
          isMobileSidebarOpen={isMobileSidebarOpen}
          onMobileSidebarClose={() => setIsMobileSidebarOpen(false)}
          users={users.map((user) => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            avatar: user.avatarUrl,
            status: user.status,
          }))}
          currentUserId={currentUser?.id || ""}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <ChannelHeader
          selectedChannel={selectedChannel}
          selectedPrivateChat={selectedPrivateChat}
          onMobileMenuClick={() => setIsMobileSidebarOpen(true)}
        />

        <ChatArea
          messages={messages}
          onSendMessage={
            selectedPrivateChat ? handleSendPrivateMessage : handleSendMessage
          }
          onReaction={handleReaction}
          onFileUpload={handleFileUpload}
          currentUser={currentUser}
          teamName={selectedTeam?.name || ""}
          channelName={selectedChannel?.name || ""}
        />
      </div>

      {showUserList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Select User to Chat With</h2>
            <div className="max-h-96 overflow-y-auto">
              {users.length > 0 ? (
                users
                  .filter((user) => user.id !== currentUser?.id)
                  .map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        startPrivateChat(user.id);
                      }}
                    >
                      <img
                        src={user.avatarUrl || "/default-avatar.png"}
                        alt={user.firstName}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.status}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center p-4 text-gray-500">
                  No users found. Please try again later.
                </div>
              )}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => setShowUserList(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsChat;
