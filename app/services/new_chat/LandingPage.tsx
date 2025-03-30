"use client";
import { getAccessToken } from "@/app/lib/auth-utils";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function WebSocketTest() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("Disconnected");
  const [socket, setSocket] = useState(null);

  const connectWebSocket = () => {
    const token = getAccessToken();
    if (!token) {
      alert("No JWT token found");
      return;
    }

    setStatus("Connecting...");

    // Create Socket.IO connection with auth token
    const newSocket = io("http://localhost:8082", {
      path: "/ws",
      auth: { token },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      setStatus("Connected");
      console.log("Socket.IO connected successfully");

      // Subscribe to test room
      newSocket.emit("subscribe-to-test", {
        timestamp: new Date().toISOString(),
      });
    });

    newSocket.on("subscription-confirmed", (data) => {
      console.log("Subscribed to room:", data);
    });

    newSocket.on("test-response", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("test-private-response", (message) => {
      console.log("Received private response:", message);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
      setStatus(`Error: ${error.message}`);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
      setStatus("Disconnected");
    });

    setSocket(newSocket);
  };

  const sendMessage = () => {
    if (!socket || !socket.connected || !input.trim()) return;

    socket.emit("test-message", {
      content: input,
      timestamp: new Date().toISOString(),
    });

    setInput("");
  };

  useEffect(() => {
    return () => {
      if (socket) socket.disconnect();
    };
  }, [socket]);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>WebSocket Test</h1>
      <p>
        Status: <strong>{status}</strong>
      </p>

      <div style={{ margin: "20px 0" }}>
        <button
          onClick={connectWebSocket}
          disabled={status === "Connected"}
          style={{ padding: "8px 16px", marginRight: "10px" }}
        >
          Connect
        </button>
        <button
          onClick={() => socket?.disconnect()}
          disabled={status !== "Connected"}
          style={{ padding: "8px 16px" }}
        >
          Disconnect
        </button>
      </div>

      <div style={{ margin: "20px 0" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ padding: "8px", width: "70%", marginRight: "10px" }}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          disabled={!socket?.connected}
          style={{ padding: "8px 16px" }}
        >
          Send
        </button>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "auto",
        }}
      >
        <h3>Messages:</h3>
        {messages.length === 0 ? (
          <p>No messages yet</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {messages.map((msg, index) => (
              <li
                key={index}
                style={{
                  margin: "5px 0",
                  padding: "5px",
                  background: "#f5f5f5",
                }}
              >
                <strong>
                  {new Date(
                    msg.timestamp || msg.serverTimestamp
                  ).toLocaleTimeString()}
                  :
                </strong>{" "}
                {msg.content}
                {msg.userId && (
                  <span
                    style={{
                      fontSize: "0.8em",
                      color: "#666",
                      marginLeft: "5px",
                    }}
                  >
                    {" "}
                    (from user: {msg.userId})
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// "use client";
// import React, { useState, useEffect, useRef, useCallback } from "react";
// import TeamsSidebar from "../chat/components/TeamSidebar";
// import ChatArea from "./components/ChatArea";
// import ChannelHeader from "../chat/components/ChatHeader";
// import { api as axios } from "@/app/lib/api";
// import { Client } from "@stomp/stompjs";
// import { getAccessToken, refreshAccessToken } from "@/app/lib/auth-utils";
// import Team from "@/app/types/models_types/team";
// import { UserTeam as User } from "@/app/types/models_types/userType";
// import Channel from "@/app/types/models_types/channel";

// interface Message {
//   id: string;
//   sender: {
//     id: string;
//     name: string;
//     avatar?: string;
//     status: "online" | "offline" | "away" | "busy";
//   };
//   content: string;
//   timestamp: string;
//   attachments: any[];
//   reactions: any[];
//   isRead: boolean;
// }

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
// const SOCKET_URL =
//   process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8082";

// const TeamsChat: React.FC = () => {
//   // State
//   const [teams, setTeams] = useState<Team[]>([]);
//   const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
//   const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
//   const [users, setUsers] = useState<User[]>([]);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
//   const [currentUser, setCurrentUser] = useState<User>({} as User);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isSocketConnected, setIsSocketConnected] = useState(false);

//   // Refs
//   const stompClientRef = useRef<Client | null>(null);
//   const messageEndRef = useRef<HTMLDivElement>(null);
//   const reconnectAttemptsRef = useRef(0);
//   const maxReconnectAttempts = 3;

//   // Auto-scroll to new messages
//   useEffect(() => {
//     messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // Format message helper
//   const formatMessage = useCallback(
//     (msg: any): Message => ({
//       id: msg.id.toString(),
//       sender: {
//         id: msg.sender.id.toString(),
//         name: `${msg.sender.firstName} ${msg.sender.lastName}`,
//         avatar: msg.sender.profileImageUrl,
//         status: msg.sender.status?.toLowerCase() || "offline",
//       },
//       content: msg.content,
//       timestamp: msg.createdAt,
//       attachments: msg.attachments || [],
//       reactions: msg.reactions || [],
//       isRead: false,
//     }),
//     []
//   );

//   // WebSocket connection
//   const connectWebSocket = useCallback(async () => {
//     try {
//       const token = getAccessToken();
//       if (!token) {
//         throw new Error("No access token available");
//       }

//       const client = new Client({
//         brokerURL: `${SOCKET_URL.replace("http", "ws")}/ws`,
//         connectHeaders: {
//           Authorization: `Bearer ${token}`,
//           // Adaugă headere CORS dacă e necesar
//           "Access-Control-Allow-Origin":
//             process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
//         },
//         reconnectDelay: 5000,
//         heartbeatIncoming: 4000,
//         heartbeatOutgoing: 4000,
//         debug: (str) => console.log("STOMP: ", str),
//       });

//       // Restul codului rămâne la fel
//     } catch (err) {
//       console.error("WebSocket initialization failed:", err);
//       setIsSocketConnected(false);
//     }
//   }, [selectedChannel]);

//   const subscribeToChannel = useCallback(() => {
//     if (!stompClientRef.current?.connected || !selectedChannel || !selectedTeam)
//       return;

//     const messageTopic = `/topic/team:${selectedTeam.id}:channel:${selectedChannel.id}`;
//     const typingTopic = `${messageTopic}:typing`;

//     // Clear previous subscriptions
//     stompClientRef.current.subscriptions.forEach((sub) => {
//       stompClientRef.current?.unsubscribe(sub.id);
//     });

//     // Message subscription
//     stompClientRef.current.subscribe(messageTopic, (message) => {
//       const newMessage = JSON.parse(message.body);
//       setMessages((prev) => [...prev, formatMessage(newMessage)]);
//     });

//     // Typing indicator
//     stompClientRef.current.subscribe(typingTopic, (message) => {
//       const { userId, isTyping } = JSON.parse(message.body);
//       setTypingUsers((prev) => {
//         const newSet = new Set(prev);
//         isTyping ? newSet.add(userId) : newSet.delete(userId);
//         return newSet;
//       });
//     });

//     // Join channel
//     stompClientRef.current.publish({
//       destination: "/app/join-channel",
//       body: JSON.stringify({
//         teamId: selectedTeam.id,
//         channelId: selectedChannel.id,
//       }),
//       headers: { Authorization: `Bearer ${getAccessToken()}` },
//     });
//   }, [selectedTeam, selectedChannel, formatMessage]);

//   // Load team details with channels
//   const loadTeamDetails = useCallback(
//     async (team: Team) => {
//       try {
//         console.log(`Fetching channels for team ${team.id}`);
//         const channelsResponse = await axios.get(
//           `${API_BASE_URL}/api/teams/${team.id}/channels`
//         );
//         console.log("Channels response:", channelsResponse.data);

//         const channels = await Promise.all(
//           channelsResponse.data.map(async (channel: any) => {
//             try {
//               console.log(`Fetching unread count for channel ${channel.id}`);
//               const unread = await axios.get(
//                 `${API_BASE_URL}/api/channels/${channel.id}/unread-count`
//               );
//               console.log(
//                 `Unread count for channel ${channel.id}:`,
//                 unread.data
//               );
//               return { ...channel, unreadCount: unread.data || 0 };
//             } catch (err) {
//               console.error(
//                 `Error fetching unread count for channel ${channel.id}:`,
//                 err
//               );
//               return { ...channel, unreadCount: 0 };
//             }
//           })
//         );
//         return { ...team, channels };
//       } catch (err) {
//         console.error(`Error loading team details for team ${team.id}:`, err);
//         return { ...team, channels: [] };
//       }
//     },
//     [API_BASE_URL]
//   );

//   // Initial data loading
//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const [userData, teamsData] = await Promise.all([
//           axios.get(`${API_BASE_URL}/api/users/current`),
//           axios.get(`${API_BASE_URL}/api/teams`),
//         ]);

//         console.log("User data:", userData.data);
//         console.log("Teams data:", teamsData.data);

//         setCurrentUser(userData.data);
//         const teamsWithChannels = await Promise.all(
//           teamsData.data.map(loadTeamDetails)
//         );
//         setTeams(teamsWithChannels);

//         if (teamsWithChannels.length > 0) {
//           const firstTeam = teamsWithChannels[0];
//           setSelectedTeam(firstTeam);
//           setSelectedChannel(firstTeam.channels[0] || null);
//         }

//         await connectWebSocket();
//         setLoading(false);
//       } catch (err) {
//         console.error("Failed to load initial data:", err);
//         setError("Failed to load data. Please try again.");
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, [connectWebSocket, loadTeamDetails]);

//   // Load messages when channel changes
//   useEffect(() => {
//     if (!selectedChannel) return;

//     const fetchMessages = async () => {
//       try {
//         const response = await axios.get(
//           `${API_BASE_URL}/api/channels/${selectedChannel.id}/messages`
//         );
//         console.log("Messages response:", response.data);
//         setMessages(response.data.map(formatMessage));
//       } catch (err) {
//         console.error("Failed to load messages:", err);
//         setMessages([]);
//       }
//     };

//     fetchMessages();
//     if (isSocketConnected) subscribeToChannel();
//   }, [selectedChannel, isSocketConnected, subscribeToChannel, formatMessage]);

//   // Handlers
//   const handleSendMessage = async (content: string) => {
//     if (!selectedChannel || !currentUser?.id) return;

//     try {
//       const message = {
//         channelId: selectedChannel.id,
//         senderId: currentUser.id,
//         content,
//       };

//       await axios.post(`${API_BASE_URL}/api/messages`, message);
//     } catch (err) {
//       console.error("Failed to send message:", err);
//     }
//   };

//   const handleTyping = (isTyping: boolean) => {
//     if (
//       !selectedTeam ||
//       !selectedChannel ||
//       !stompClientRef.current?.connected ||
//       !currentUser?.id
//     )
//       return;

//     stompClientRef.current.publish({
//       destination: "/app/typing",
//       body: JSON.stringify({
//         teamId: selectedTeam.id,
//         channelId: selectedChannel.id,
//         userId: currentUser.id,
//         isTyping,
//       }),
//       headers: { Authorization: `Bearer ${getAccessToken()}` },
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="animate-pulse flex flex-col items-center">
//           <div className="h-12 w-12 rounded-full bg-gray-200 mb-4"></div>
//           <div className="h-4 w-32 bg-gray-200 rounded"></div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen text-center p-6">
//         <div className="bg-red-50 text-red-600 p-4 rounded-lg max-w-md">
//           <h3 className="font-medium mb-2">{error}</h3>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
//           >
//             Refresh Page
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Sidebar */}
//       <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
//         <div className="p-4 border-b border-gray-200">
//           <h2 className="text-xl font-semibold text-gray-800">Teams</h2>
//         </div>
//         <TeamsSidebar
//           teams={teams}
//           selectedTeam={selectedTeam}
//           selectedChannel={selectedChannel}
//           onTeamSelect={(teamId) => {
//             const team = teams.find((t) => t.id === teamId);
//             setSelectedTeam(team || null);
//             setSelectedChannel(team?.channels[0] || null);
//           }}
//           onChannelSelect={(channelId) => {
//             if (!selectedTeam) return;
//             const channel = selectedTeam.channels.find(
//               (c) => c.id === channelId
//             );
//             setSelectedChannel(channel || null);
//           }}
//         />
//       </div>

//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {selectedChannel && selectedTeam ? (
//           <>
//             <ChannelHeader
//               team={selectedTeam}
//               channel={selectedChannel}
//               onlineUsers={users.filter((u) => u.status === "online").length}
//               totalUsers={users.length}
//               typingUsers={Array.from(typingUsers)
//                 .filter((id) => id !== currentUser?.id)
//                 .map((id) => users.find((u) => u.id === id)?.name)
//                 .filter(Boolean)
//                 .join(", ")}
//               connectionStatus={
//                 isSocketConnected ? "connected" : "disconnected"
//               }
//             />

//             <ChatArea
//               messages={messages}
//               currentUser={currentUser}
//               users={users}
//               onSendMessage={handleSendMessage}
//               onTyping={handleTyping}
//               isConnected={isSocketConnected}
//               messageEndRef={messageEndRef}
//             />
//           </>
//         ) : (
//           <div className="flex flex-col items-center justify-center h-full text-center p-6">
//             <div className="max-w-md">
//               <h3 className="text-lg font-medium text-gray-800 mb-2">
//                 {teams.length === 0
//                   ? "No teams available"
//                   : "No channel selected"}
//               </h3>
//               <p className="text-gray-500">
//                 {teams.length === 0
//                   ? "You don't have access to any teams yet"
//                   : "Please select a channel from the sidebar to start chatting"}
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TeamsChat;
// "use client";
// import React, { useState, useEffect, useRef, useCallback } from "react";
// import TeamsSidebar from "../chat/components/TeamSidebar";
// import ChatArea from "./components/ChatArea";
// import ChannelHeader from "../chat/components/ChatHeader";
// import { api as axios } from "@/app/lib/api";
// import { Client } from "@stomp/stompjs";
// import SockJS from "sockjs-client";
// import { getAccessToken, refreshAccessToken } from "@/app/lib/auth-utils";
// import Team from "@/app/types/models_types/team";
// import { UserTeam as User } from "@/app/types/models_types/userType";
// import Channel from "@/app/types/models_types/channel";

// interface Message {
//   id: string;
//   sender: {
//     id: string;
//     name: string;
//     avatar?: string;
//     status: string;
//   };
//   content: string;
//   timestamp: string;
//   attachments: any[];
//   reactions: any[];
//   isRead: boolean;
// }

// interface TypingIndicator {
//   userId: string;
//   isTyping: boolean;
// }

// interface ReadStatus {
//   userId: string;
//   channelId: string;
//   unreadCount: number;
// }

// interface TokenData {
//   token: string;
//   expiresIn?: number;
// }

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082/api";

// const SOCKET_URL =
//   process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8082";

// const TeamsChat: React.FC = () => {
//   // State declarations
//   const [teams, setTeams] = useState<Team[]>([]);
//   const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
//   const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
//   const [users, setUsers] = useState<User[]>([]);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
//   const [currentUser, setCurrentUser] = useState<User>({} as User);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isSocketConnected, setIsSocketConnected] = useState(false);

//   // Refs
//   const stompClientRef = useRef<Client | null>(null);
//   const reconnectAttemptsRef = useRef(0);
//   const maxReconnectAttempts = 5;

//   // Helper functions
//   const isTokenExpired = (token: string | null): boolean => {
//     if (!token) return true;
//     try {
//       const payload = JSON.parse(atob(token.split(".")[1]));
//       return payload.exp * 1000 < Date.now();
//     } catch {
//       return true;
//     }
//   };

//   // WebSocket functions
//   const subscribeToChannels = useCallback(() => {
//     if (!stompClientRef.current?.connected || !teams.length) return;

//     teams.forEach((team) => {
//       team.channels.forEach((channel) => {
//         const messageTopic = `/topic/team:${team.id}:channel:${channel.id}`;
//         const typingTopic = `/topic/team:${team.id}:channel:${channel.id}:typing`;

//         // Message subscription
//         stompClientRef.current?.subscribe(messageTopic, (message) => {
//           const newMessage = JSON.parse(message.body);
//           setMessages((prev) => [
//             ...prev,
//             {
//               id: newMessage.id.toString(),
//               sender: {
//                 id: newMessage.sender.id.toString(),
//                 name: `${newMessage.sender.firstName} ${newMessage.sender.lastName}`,
//                 avatar: newMessage.sender.profileImageUrl,
//                 status: newMessage.sender.status?.toLowerCase() || "offline",
//               },
//               content: newMessage.content,
//               timestamp: newMessage.createdAt,
//               attachments: newMessage.attachments || [],
//               reactions: newMessage.reactions || [],
//               isRead: false,
//             },
//           ]);
//         });

//         // Typing indicator subscription
//         stompClientRef.current?.subscribe(typingTopic, (message) => {
//           const typingData: TypingIndicator = JSON.parse(message.body);
//           setTypingUsers((prev) => {
//             const newSet = new Set(prev);
//             if (typingData.isTyping) {
//               newSet.add(typingData.userId);
//             } else {
//               newSet.delete(typingData.userId);
//             }
//             return newSet;
//           });
//         });
//       });
//     });
//   }, [teams, selectedChannel, currentUser]);

//   const initializeWebSocketConnection = useCallback(
//     async (initialToken?: string) => {
//       try {
//         let token = initialToken || getAccessToken();
//         if (!token || isTokenExpired(token)) {
//           const tokenData = await refreshAccessToken();
//           token = tokenData.token;
//         }

//         // Folosim direct WebSocket (nu SockJS)
//         stompClientRef.current = new Client({
//           brokerURL: `${SOCKET_URL}/ws`, // Adaugă /ws la URL
//           connectHeaders: {
//             Authorization: `Bearer ${token}`,
//           },
//           debug: (str) => {
//             if (str.toLowerCase().includes("error")) {
//               console.error(str);
//             }
//           },
//           reconnectDelay: 5000,
//           heartbeatIncoming: 4000,
//           heartbeatOutgoing: 4000,
//           onConnect: (frame) => {
//             console.log("Connected to WebSocket");
//             setIsSocketConnected(true);
//             reconnectAttemptsRef.current = 0;
//             subscribeToChannels();
//           },
//           onStompError: (frame) => {
//             console.error("STOMP error:", frame.headers.message);
//             setIsSocketConnected(false);
//             if (
//               frame.headers.message?.toLowerCase().includes("expired") ||
//               frame.headers.message?.toLowerCase().includes("invalid token")
//             ) {
//               refreshTokenAndReconnect().catch(() => {
//                 setError("Session expired. Please login again.");
//               });
//             } else {
//               setError(
//                 `WebSocket error: ${
//                   frame.headers?.message || "Connection error"
//                 }`
//               );
//               attemptReconnect();
//             }
//           },
//           onWebSocketError: (event) => {
//             console.error("WebSocket error:", event);
//             setIsSocketConnected(false);
//             setError("WebSocket connection error");
//             attemptReconnect();
//           },
//         });

//         stompClientRef.current.activate();
//       } catch (err) {
//         console.error("WebSocket initialization error:", err);
//         setError("Failed to initialize WebSocket connection");
//         attemptReconnect();
//       }
//     },
//     [subscribeToChannels]
//   );

//   const refreshTokenAndReconnect = useCallback(async () => {
//     try {
//       const tokenData = await refreshAccessToken();
//       if (stompClientRef.current) {
//         stompClientRef.current.deactivate();
//       }
//       await initializeWebSocketConnection(tokenData.token);
//       return tokenData.token;
//     } catch (error) {
//       console.error("Token refresh failed:", error);
//       window.location.href = "/login";
//       throw error;
//     }
//   }, [initializeWebSocketConnection]);

//   const attemptReconnect = useCallback(() => {
//     if (reconnectAttemptsRef.current < maxReconnectAttempts) {
//       reconnectAttemptsRef.current += 1;
//       setTimeout(() => {
//         initializeWebSocketConnection();
//       }, 5000);
//     } else {
//       setError("Max reconnection attempts reached. Please refresh the page.");
//     }
//   }, [initializeWebSocketConnection]);

//   // Initialize app
//   useEffect(() => {
//     const initializeApp = async () => {
//       try {
//         setLoading(true);

//         // Fetch current user
//         const userResponse = await axios.get(`/api/users/current`);
//         setCurrentUser(userResponse.data);

//         // Fetch team members
//         const teamMatesResponse = await axios.get(`/api/users/team-mates`);
//         setUsers(teamMatesResponse.data);

//         // Fetch teams with channels
//         const teamsResponse = await axios.get(`/api/teams`);
//         const teamsWithChannels = await Promise.all(
//           teamsResponse.data.map(async (team: any) => {
//             const channelsResponse = await axios.get(
//               `/api/teams/${team.id}/channels`
//             );

//             const channelsWithUnread = await Promise.all(
//               channelsResponse.data.map(async (channel: any) => {
//                 try {
//                   const unreadResponse = await axios.get(
//                     `${API_BASE_URL}/channels/${channel.id}/unread-count`
//                   );
//                   return {
//                     ...channel,
//                     unreadCount: unreadResponse.data || 0,
//                   };
//                 } catch (err) {
//                   console.error("Error fetching unread count:", err);
//                   return {
//                     ...channel,
//                     unreadCount: 0,
//                   };
//                 }
//               })
//             );

//             return {
//               ...team,
//               channels: channelsWithUnread,
//             };
//           })
//         );

//         setTeams(teamsWithChannels);

//         if (teamsWithChannels.length > 0) {
//           setSelectedTeam(teamsWithChannels[0]);
//           if (teamsWithChannels[0].channels.length > 0) {
//             setSelectedChannel(teamsWithChannels[0].channels[0]);
//           }
//         }

//         setLoading(false);
//         initializeWebSocketConnection();
//       } catch (err) {
//         console.error("Error initializing app:", err);
//         setError("Failed to load initial data. Please refresh the page.");
//         setLoading(false);
//       }
//     };

//     initializeApp();

//     return () => {
//       if (stompClientRef.current) {
//         stompClientRef.current.deactivate();
//       }
//     };
//   }, [initializeWebSocketConnection]);

//   // Fetch messages when channel changes
//   useEffect(() => {
//     if (!selectedChannel) return;

//     const fetchMessages = async () => {
//       try {
//         const response = await axios.get(
//           `${API_BASE_URL}/channels/${selectedChannel.id}/messages`
//         );
//         const messageDisplays = response.data.map((msg: any) => ({
//           id: msg.id.toString(),
//           sender: {
//             id: msg.sender.id.toString(),
//             name: `${msg.sender.firstName} ${msg.sender.lastName}`,
//             avatar: msg.sender.profileImageUrl,
//             status: msg.sender.status?.toLowerCase() || "offline",
//           },
//           content: msg.content,
//           timestamp: msg.createdAt,
//           attachments: msg.attachments || [],
//           reactions: msg.reactions || [],
//           isRead: msg.isRead || false,
//         }));
//         setMessages(messageDisplays);

//         if (isSocketConnected && stompClientRef.current) {
//           stompClientRef.current.publish({
//             destination: "/app/focus-channel",
//             body: selectedChannel.id,
//           });
//         }
//       } catch (err) {
//         console.error("Error fetching messages:", err);
//         setError("Failed to load messages. Please try again.");
//       }
//     };

//     fetchMessages();
//   }, [selectedChannel, isSocketConnected]);

//   // UI handlers
//   const handleTeamSelect = (teamId: string) => {
//     const team = teams.find((t) => t.id === teamId);
//     if (team) {
//       setSelectedTeam(team);
//       if (team.channels.length > 0) {
//         setSelectedChannel(team.channels[0]);
//       } else {
//         setSelectedChannel(null);
//         setMessages([]);
//       }
//     }
//   };

//   const handleChannelSelect = (channelId: string) => {
//     if (!selectedTeam) return;
//     const channel = selectedTeam.channels.find((c) => c.id === channelId);
//     if (channel) setSelectedChannel(channel);
//   };

//   const handleSendMessage = async (content: string) => {
//     if (!selectedChannel || !currentUser || !stompClientRef.current) return;

//     try {
//       const messageData = {
//         channelId: selectedChannel.id,
//         senderId: currentUser.id,
//         content,
//       };

//       if (isSocketConnected) {
//         stompClientRef.current.publish({
//           destination: "/app/send-message",
//           body: JSON.stringify(messageData),
//           headers: {
//             Authorization: `Bearer ${getAccessToken()}`,
//           },
//         });
//       }

//       await axios.post(`${API_BASE_URL}/messages`, messageData);
//     } catch (err) {
//       console.error("Error sending message:", err);
//       setError("Failed to send message. Please try again.");
//     }
//   };

//   const handleTyping = (isTyping: boolean) => {
//     if (
//       !selectedTeam ||
//       !selectedChannel ||
//       !isSocketConnected ||
//       !stompClientRef.current
//     )
//       return;

//     stompClientRef.current.publish({
//       destination: "/app/typing",
//       body: JSON.stringify({
//         teamId: selectedTeam.id,
//         channelId: selectedChannel.id,
//         userId: currentUser.id,
//         isTyping,
//       }),
//       headers: {
//         Authorization: `Bearer ${getAccessToken()}`,
//       },
//     });
//   };

//   const handleReaction = async (messageId: string, reactionType: string) => {
//     try {
//       await axios.post(`${API_BASE_URL}/messages/${messageId}/reactions`, {
//         user_id: currentUser.id,
//         reaction_type: reactionType,
//         action: "add",
//       });
//     } catch (err) {
//       console.error("Error adding reaction:", err);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         Loading...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-screen text-red-500">
//         {error}
//         <button
//           onClick={() => window.location.reload()}
//           className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
//         >
//           Refresh Page
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-white">
//       <div className="w-64 bg-gray-100 border-r border-gray-200">
//         <TeamsSidebar
//           teams={teams}
//           selectedTeam={selectedTeam}
//           selectedChannel={selectedChannel}
//           onTeamSelect={handleTeamSelect}
//           onChannelSelect={handleChannelSelect}
//         />
//       </div>

//       <div className="flex flex-col flex-1 overflow-hidden">
//         {selectedChannel && selectedTeam ? (
//           <>
//             <ChannelHeader
//               team={selectedTeam}
//               channel={selectedChannel}
//               onlineUsers={users.filter((u) => u.status === "online").length}
//               totalUsers={users.length}
//               typingUsers={Array.from(typingUsers)
//                 .filter((id) => id !== currentUser.id)
//                 .map((id) => users.find((u) => u.id === id)?.firstName)
//                 .filter(Boolean)
//                 .join(", ")}
//               connectionStatus={
//                 isSocketConnected ? "connected" : "disconnected"
//               }
//             />

//             <ChatArea
//               messages={messages}
//               currentUser={currentUser}
//               users={users}
//               onSendMessage={handleSendMessage}
//               onReaction={handleReaction}
//               onTyping={handleTyping}
//               onFileUpload={() => Promise.resolve(null)}
//               teamName={selectedTeam.name}
//               channelName={selectedChannel.name}
//               isConnected={isSocketConnected}
//             />
//           </>
//         ) : (
//           <div className="flex items-center justify-center h-full">
//             Please select a channel to start chatting
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TeamsChat;
