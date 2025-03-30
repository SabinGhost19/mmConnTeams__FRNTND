"use client";
import { getAccessToken } from "@/app/lib/auth-utils";
import { useEffect, useState, useCallback, useRef } from "react";
import { Socket, io } from "socket.io-client";
import { MessageDTO } from "./interface";

interface WebSocketClientProps {
  channelId?: string;
  onMessagesReceived?: (messages: MessageDTO[]) => void;
  onUserJoined?: (data: any) => void;
  onUserLeft?: (data: any) => void;
  onTyping?: (data: any) => void;
}

interface WebSocketClientReturn {
  status: "disconnected" | "connecting" | "connected" | "error";
  error: string | null;
  messages: MessageDTO[];
  sendMessage: (content: string, attachments?: any[]) => boolean;
  sendTyping: (isTyping: boolean) => void;
  addReaction: (messageId: string, reactionType: string) => boolean;
  removeReaction: (messageId: string, reactionId: string) => boolean;
  reconnect: () => Socket | undefined;
  disconnect: () => void;
}

// WebSocketClient component
const WebSocketClient = ({
  channelId,
  onMessagesReceived,
  onUserJoined,
  onUserLeft,
  onTyping,
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

    // Message sent confirmation
    newSocket.on("message-sent", (confirmation) => {
      console.log("Message sent confirmation:", confirmation);
    });

    // Reaction updates
    newSocket.on("reaction-update", (reaction) => {
      console.log("Reaction update:", reaction);

      // Update messages with the new reaction using current ref
      const updatedMessages = messagesRef.current.map((msg) => {
        if (msg.id === reaction.messageId) {
          // For add reaction
          if (reaction.action === "add") {
            return {
              ...msg,
              reactions: [...(msg.reactions || []), reaction],
            };
          }
          // For remove reaction
          else if (reaction.action === "remove") {
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

  // Send a message
  const sendMessage = useCallback(
    (content: string, attachments: any[] = []) => {
      if (!isSocketReady() || !content) return false;

      socketRef.current!.emit("new-message", {
        channelId: channelIdRef.current,
        content,
        attachments,
        timestamp: new Date().toISOString(),
      });

      return true;
    },
    [isSocketReady]
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
      if (!isSocketReady()) return false;

      socketRef.current!.emit("add-reaction", {
        messageId,
        channelId: channelIdRef.current,
        reactionType,
      });

      return true;
    },
    [isSocketReady]
  );

  // Remove a reaction
  const removeReaction = useCallback(
    (messageId: string, reactionId: string) => {
      if (!isSocketReady()) return false;

      socketRef.current!.emit("remove-reaction", {
        messageId,
        reactionId,
        channelId: channelIdRef.current,
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
    sendTyping,
    addReaction,
    removeReaction,
    reconnect: () => {
      hasConnectedRef.current = false;
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      connectionAttemptsRef.current = 0;
      return connect();
    },
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
