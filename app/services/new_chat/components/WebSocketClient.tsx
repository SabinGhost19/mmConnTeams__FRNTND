"use client";
import { getAccessToken } from "@/app/lib/auth-utils";
import { useEffect, useState, useCallback, useRef } from "react";
import { Socket, io } from "socket.io-client";
import { MessageDTO } from "./interface";
import LoadingBox from "./LoadingBox";

interface WebSocketClientProps {
  channelId?: string;
  chatId?: string; // For private chats
  onMessagesReceived?: (messages: MessageDTO[]) => void;
  onUserJoined?: (data: any) => void;
  onUserLeft?: (data: any) => void;
  onTyping?: (data: any) => void;
  onPrivateMessage?: (message: MessageDTO) => void;
}

interface WebSocketClientReturn {
  status: "disconnected" | "connecting" | "connected" | "error";
  error: string | null;
  messages: MessageDTO[];
  sendMessage: (content: string, attachments?: any[]) => boolean;
  sendPrivateMessage: (
    chatId: string,
    content: string,
    attachments?: any[]
  ) => boolean;
  sendTyping: (isTyping: boolean) => void;
  addReaction: (messageId: string, reactionType: string) => boolean;
  removeReaction: (
    messageId: string,
    reactionType: string,
    reactionId: string
  ) => boolean;
  reconnect: () => Socket | undefined;
  disconnect: () => void;
  refreshMessages: () => void;
  uploadFile: (file: File, teamId: string) => Promise<any>;
  joinPrivateChat: (chatId: string) => void;
  leavePrivateChat: (chatId: string) => void;
}

// WebSocketClient component
const WebSocketClient = ({
  channelId,
  chatId,
  onMessagesReceived,
  onUserJoined,
  onUserLeft,
  onTyping,
  onPrivateMessage,
}: WebSocketClientProps): WebSocketClientReturn => {
  const [status, setStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Use refs to prevent infinite renders and manage socket state
  const socketRef = useRef<Socket | null>(null);
  const messagesRef = useRef<MessageDTO[]>([]);
  const hasConnectedRef = useRef<boolean>(false);
  const channelIdRef = useRef<string | undefined>(channelId);
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionAttemptsRef = useRef<number>(0);

  // Debug counter for tracking renders and connection attempts
  const debugCounterRef = useRef<{ renders: number; connects: number }>({
    renders: 0,
    connects: 0,
  });

  // Connect to WebSocket - with no dependencies to prevent recreation
  const connect = useCallback(() => {
    // Debug logging
    debugCounterRef.current.connects++;
    console.log(
      `WebSocket connect attempt #${debugCounterRef.current.connects} for channel ${channelIdRef.current}`
    );

    // Prevent multiple connection attempts within a short time
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
      connectTimeoutRef.current = null;
    }

    // If we already have a connection to the current channel, don't reconnect
    if (socketRef.current?.connected && hasConnectedRef.current) {
      console.log(`Already connected to channel ${channelIdRef.current}`);
      return socketRef.current;
    }

    // Limit connection attempts
    if (connectionAttemptsRef.current > 5) {
      console.log("Too many connection attempts, stopping");
      setError("Too many connection attempts. Please try again later.");
      setStatus("error");
      return;
    }

    connectionAttemptsRef.current++;

    const token = getAccessToken();
    if (!token) {
      setError("No JWT token found");
      return;
    }

    setStatus("connecting");
    setError(null);

    // Clean up existing socket if there is one
    if (socketRef.current) {
      console.log("Cleaning up existing socket before reconnection");
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Create Socket.IO connection with auth token
    const newSocket = io(
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:8082",
      {
        path: "/ws",
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 5000,
      }
    );

    // Connection events
    newSocket.on("connect", () => {
      console.log(
        `Socket connected successfully, connecting to channel: ${channelIdRef.current}`
      );
      setStatus("connected");
      connectionAttemptsRef.current = 0;

      // Join channel if provided
      if (channelIdRef.current) {
        newSocket.emit("join-channel", { channelId: channelIdRef.current });
      }
    });

    // Channel joined event
    newSocket.on("channel-joined", (data) => {
      console.log(`Joined channel: ${data.channelId}`, data);
    });

    // Receive channel history
    newSocket.on("channel-history", (data) => {
      if (data && data.messages) {
        console.log(
          `Received ${data.messages.length} messages for channel ${data.channelId}`
        );

        // Update both state and ref
        setMessages(data.messages);
        messagesRef.current = data.messages;

        // Notify parent component
        if (onMessagesReceived) {
          onMessagesReceived(data.messages);
        }
      }
    });

    // Receive new messages
    newSocket.on("message", (message: MessageDTO) => {
      console.log("New message received:", message);

      // Update using the latest ref value
      const updatedMessages = [...messagesRef.current, message];
      setMessages(updatedMessages);
      messagesRef.current = updatedMessages;

      // Notify parent component
      if (onMessagesReceived) {
        onMessagesReceived(updatedMessages);
      }
    });

    // File upload notification
    newSocket.on("file-uploaded", (data) => {
      console.log("File upload notification received:", data);

      // Here we could update the UI to show a notification
      // or refresh the messages if needed

      // We don't need to update messages manually as the file will be
      // attached to a message which will be broadcast separately
    });

    // Message sent confirmation
    newSocket.on("message-sent", (confirmation) => {
      console.log("Message sent confirmation:", confirmation);
    });

    // Reaction updates
    newSocket.on("reaction-update", (reaction) => {
      console.log("Reaction update received:", reaction);

      // Update messages with the new reaction using current ref
      const updatedMessages = messagesRef.current.map((msg) => {
        if (msg.id === reaction.messageId) {
          // For add reaction
          if (reaction.action === "add") {
            console.log(
              `Adding reaction to message ${msg.id}: ${reaction.reactionType}`
            );
            return {
              ...msg,
              reactions: [...(msg.reactions || []), reaction],
            };
          }
          // For remove reaction
          else if (reaction.action === "remove") {
            console.log(
              `Removing reaction from message ${msg.id}: ${reaction.reactionType} (ID: ${reaction.id})`
            );
            return {
              ...msg,
              reactions: (msg.reactions || []).filter(
                (r: { id: any }) => r.id !== reaction.id
              ),
            };
          }
        }
        return msg;
      });

      setMessages(updatedMessages);
      messagesRef.current = updatedMessages;

      if (onMessagesReceived) {
        onMessagesReceived(updatedMessages);
      }
    });

    // User activity events
    newSocket.on("user-joined", (data) => {
      console.log("User joined:", data);
      if (onUserJoined) onUserJoined(data);
    });

    newSocket.on("user-left", (data) => {
      console.log("User left:", data);
      if (onUserLeft) onUserLeft(data);
    });

    newSocket.on("user-typing", (data) => {
      console.log("User typing:", data);
      if (onTyping) onTyping(data);
    });

    // Error handling
    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
      setStatus("error");
      setError(`Connection error: ${error.message}`);
      hasConnectedRef.current = false;
    });

    newSocket.on("error", (errorData) => {
      console.error("Socket error:", errorData);
      setError(
        typeof errorData === "string"
          ? errorData
          : errorData.message || "Unknown error"
      );
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
      setStatus("disconnected");
      hasConnectedRef.current = false;
    });

    // Private chat events
    newSocket.on("private-messages", (data) => {
      console.log(
        `Received ${data.messages.length} private messages for chat ${data.chatId}`
      );
      if (onMessagesReceived) {
        onMessagesReceived(data.messages);
      }
    });

    newSocket.on("new-private-message", (data) => {
      console.log("New private message received:", data.message);
      if (onPrivateMessage) {
        onPrivateMessage(data.message);
      }
    });

    // Store socket in ref
    socketRef.current = newSocket;
    hasConnectedRef.current = true;

    return newSocket;
  }, []); // No dependencies to prevent recreation

  // Set up connection when channelId changes
  useEffect(() => {
    // Debug logging
    debugCounterRef.current.renders++;
    console.log(
      `WebSocketClient render #${debugCounterRef.current.renders} for channel ${channelId}`
    );

    // Only connect if the channel has changed or we're not connected
    const prevChannelId = channelIdRef.current;
    if (
      channelId !== prevChannelId ||
      !socketRef.current ||
      !socketRef.current.connected
    ) {
      // Update the channelId ref
      channelIdRef.current = channelId;

      // Reset connection state
      hasConnectedRef.current = false;

      // Connect with a small delay to prevent rapid reconnections
      connectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 300);
    }

    // Cleanup function
    return () => {
      console.log("Cleaning up WebSocketClient component");
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }

      if (socketRef.current) {
        console.log("Disconnecting socket in cleanup");
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      hasConnectedRef.current = false;
      connectionAttemptsRef.current = 0;
    };
  }, [channelId, connect]);

  // Update messages ref when messages state changes
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Helper function for checking socket state
  const isSocketReady = useCallback(() => {
    return (
      socketRef.current && socketRef.current.connected && channelIdRef.current
    );
  }, []);

  // File upload function
  const uploadFile = useCallback(async (file: File, teamId: string) => {
    if (!channelIdRef.current) {
      console.error("Channel ID not available for file upload");
      return null;
    }

    try {
      const token = getAccessToken();
      if (!token) {
        setError("No JWT token found");
        return null;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("team_id", teamId);
      formData.append("channel_id", channelIdRef.current);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/files/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.status}`);
      }

      const fileData = await response.json();

      // Notify via websocket about new file attachment
      if (socketRef.current?.connected) {
        socketRef.current.emit("file-upload-complete", {
          channelId: channelIdRef.current,
          fileData: fileData,
        });
      }

      return fileData;
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file. Please try again.");
      return null;
    }
  }, []);

  // Send message with optional attachments
  const sendMessage = useCallback(
    (content: string, attachments: any[] = []) => {
      if (!socketRef.current || !socketRef.current.connected) {
        console.error("Cannot send message - socket not connected");
        return false;
      }

      if (!channelIdRef.current) {
        console.error("Cannot send message - no channel selected");
        return false;
      }

      try {
        socketRef.current.emit("new-message", {
          channelId: channelIdRef.current,
          content,
          attachments,
        });
        return true;
      } catch (err) {
        console.error("Error sending message:", err);
        return false;
      }
    },
    []
  );

  // Send typing indicator
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!isSocketReady()) return;

      socketRef.current!.emit("typing", {
        channelId: channelIdRef.current,
        isTyping,
      });
    },
    [isSocketReady]
  );

  // Add a reaction
  const addReaction = useCallback(
    (messageId: string, reactionType: string) => {
      if (!isSocketReady() || !channelIdRef.current) {
        console.error("Cannot add reaction - socket not ready");
        return false;
      }

      console.log(`Adding reaction ${reactionType} to message ${messageId}`);

      try {
        // Emit reaction to server
        socketRef.current!.emit("add-reaction", {
          messageId,
          channelId: channelIdRef.current,
          reactionType,
        });
        return true;
      } catch (err) {
        console.error("Error sending reaction:", err);
        return false;
      }
    },
    [isSocketReady]
  );

  // Remove a reaction
  const removeReaction = useCallback(
    (messageId: string, reactionType: string, reactionId: string) => {
      if (!isSocketReady()) return false;

      console.log(
        `Removing reaction: ${reactionType} (ID: ${reactionId}) from message: ${messageId}`
      );
      socketRef.current!.emit("remove-reaction", {
        messageId,
        reactionId,
        channelId: channelIdRef.current,
        reactionType,
      });

      return true;
    },
    [isSocketReady]
  );

  // Fetch channel messages - with loading state
  const refreshMessages = useCallback(() => {
    if (!socketRef.current || !channelIdRef.current) {
      console.error("Cannot refresh messages - no connection or channel");
      return;
    }

    console.log(
      `Manually refreshing messages for channel ${channelIdRef.current}`
    );

    // This will trigger the channel-history event handler
    socketRef.current.emit("join-channel", {
      channelId: channelIdRef.current,
    });
  }, []);

  const reconnect = useCallback(() => {
    console.log("Manually triggering reconnection");
    hasConnectedRef.current = false;
    setStatus("connecting");

    // Show a loading state during manual reconnection
    connectionAttemptsRef.current = 0;
    return connect();
  }, [connect]);

  const joinPrivateChat = useCallback(
    (chatId: string) => {
      if (!isSocketReady()) return;

      console.log(`Joining private chat: ${chatId}`);
      socketRef.current!.emit("join-private-chat", { chatId });
    },
    [isSocketReady]
  );

  const leavePrivateChat = useCallback(
    (chatId: string) => {
      if (!isSocketReady()) return;

      console.log(`Leaving private chat: ${chatId}`);
      socketRef.current!.emit("leave-private-chat", { chatId });
    },
    [isSocketReady]
  );

  const sendPrivateMessage = useCallback(
    (chatId: string, content: string, attachments: any[] = []) => {
      if (!isSocketReady()) return false;

      console.log(`Sending private message to chat ${chatId}: ${content}`);
      socketRef.current!.emit("private-message", {
        chatId,
        message: {
          content,
          attachments,
        },
      });

      return true;
    },
    [isSocketReady]
  );

  return {
    status,
    error,
    messages,
    sendMessage,
    sendPrivateMessage,
    sendTyping,
    addReaction,
    removeReaction,
    refreshMessages,
    uploadFile,
    reconnect,
    joinPrivateChat,
    leavePrivateChat,
    disconnect: () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      hasConnectedRef.current = false;
      connectionAttemptsRef.current = 0;
    },
  };
};

export default WebSocketClient;
