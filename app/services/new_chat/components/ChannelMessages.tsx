"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import WebSocketClient from "./WebSocketClient";
import { MessageDTO, ReactionDTO } from "./interface";
const EMOJI_MAP: Record<string, string> = {
  like: "👍",
  love: "❤️",
  laugh: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

interface ReactionProps {
  reaction: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

const Reaction = ({ reaction, count, isActive, onClick }: ReactionProps) => (
  <button
    className={`px-2 py-1 rounded-full text-xs mr-1 ${
      isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 hover:bg-gray-200"
    }`}
    onClick={onClick}
  >
    {EMOJI_MAP[reaction] || reaction} {count > 1 && count}
  </button>
);

interface MessageProps {
  message: MessageDTO;
  currentUserId: string;
  onReactionAdd: (messageId: string, reactionType: string) => void;
  onReactionRemove: (messageId: string, reactionId: string) => void;
}

const Message = ({
  message,
  currentUserId,
  onReactionAdd,
  onReactionRemove,
}: MessageProps) => {
  const isOwnMessage = message.senderId === currentUserId;

  // Group reactions by type and count them
  const reactionGroups: Record<string, { count: number; userIds: string[] }> =
    {};
  (message.reactions || []).forEach((reaction) => {
    if (!reactionGroups[reaction.reactionType]) {
      reactionGroups[reaction.reactionType] = {
        count: 0,
        userIds: [],
      };
    }
    reactionGroups[reaction.reactionType].count++;
    reactionGroups[reaction.reactionType].userIds.push(reaction.userId);
  });

  // Check if current user has reacted
  const getUserReaction = (reactionType: string): ReactionDTO | undefined => {
    return (message.reactions || []).find(
      (r) => r.userId === currentUserId && r.reactionType === reactionType
    );
  };

  const handleReaction = (reactionType: string) => {
    const existingReaction = getUserReaction(reactionType);

    if (existingReaction) {
      onReactionRemove(message.id, existingReaction.id);
    } else {
      onReactionAdd(message.id, reactionType);
    }
  };

  return (
    <div
      className={`flex mb-4 ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-xs sm:max-w-md md:max-w-lg rounded-lg p-3 ${
          isOwnMessage
            ? "bg-blue-100 rounded-br-none"
            : "bg-gray-100 rounded-bl-none"
        }`}
      >
        <div className="flex justify-between items-start mb-1">
          <span className="font-semibold text-sm">
            {isOwnMessage
              ? "You"
              : message.senderName || `User ${message.senderId?.slice(0, 8)}`}
          </span>
          <span className="text-xs text-gray-500 ml-2">
            {formatTime(message.createdAt)}
          </span>
        </div>

        <div className="mb-2">{message.content}</div>

        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center p-2 bg-white rounded border border-gray-200"
              >
                <div className="mr-2">📎</div>
                <div className="flex-1 truncate">
                  <div className="text-sm font-medium">{file.fileName}</div>
                  <div className="text-xs text-gray-500">
                    {(file.fileSize / 1024).toFixed(1)} KB
                  </div>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Reaction buttons */}
        <div className="mt-2 flex flex-wrap">
          {Object.entries(reactionGroups).map(([type, data]) => (
            <Reaction
              key={type}
              reaction={type}
              count={data.count}
              isActive={data.userIds.includes(currentUserId)}
              onClick={() => handleReaction(type)}
            />
          ))}

          {/* Add reaction button */}
          <div className="relative group">
            <button className="px-2 py-1 rounded-full text-xs bg-gray-100 hover:bg-gray-200">
              +
            </button>
            <div className="absolute bottom-full hidden group-hover:flex bg-white border rounded-lg p-1 shadow-lg">
              {Object.keys(EMOJI_MAP).map((type) => (
                <button
                  key={type}
                  className="p-1 hover:bg-gray-100 rounded"
                  onClick={() => handleReaction(type)}
                >
                  {EMOJI_MAP[type]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TypingIndicatorProps {
  typingUsers: string[];
}

const TypingIndicator = ({ typingUsers }: TypingIndicatorProps) => {
  if (typingUsers.length === 0) return null;

  let text = "";
  if (typingUsers.length === 1) {
    text = `${typingUsers[0]} is typing...`;
  } else if (typingUsers.length === 2) {
    text = `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
  } else {
    text = `${typingUsers.length} people are typing...`;
  }

  return <div className="text-xs italic text-gray-500 px-3 py-1">{text}</div>;
};

interface ChannelMessagesProps {
  channelId: string;
  currentUserId: string;
}

// Debounce utility function
const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): ReturnType<F> | undefined => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
    return undefined;
  };
};

const ChannelMessages = ({
  channelId,
  currentUserId,
}: ChannelMessagesProps) => {
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelIdRef = useRef<string>(channelId);

  // Debug counter
  const renderCountRef = useRef(0);

  // Update channel reference when it changes
  useEffect(() => {
    channelIdRef.current = channelId;
  }, [channelId]);

  // Handle messages received from WebSocket - stable reference
  const handleMessagesReceived = useCallback((newMessages: MessageDTO[]) => {
    console.log("Received messages:", newMessages.length);
    setMessages(newMessages);
  }, []);

  // Handle typing indicators from other users - stable reference
  const handleTyping = useCallback(
    (data: { userName: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        if (data.isTyping) {
          if (!prev.includes(data.userName)) {
            return [...prev, data.userName];
          }
        } else {
          return prev.filter((name) => name !== data.userName);
        }
        return prev;
      });
    },
    []
  );

  // Handle users leaving the channel - stable reference
  const handleUserLeft = useCallback((data: { userName: string }) => {
    setTypingUsers((prev) => prev.filter((name) => name !== data.userName));
  }, []);

  // Debug render counts
  useEffect(() => {
    renderCountRef.current += 1;
    console.log(
      `ChannelMessages render #${renderCountRef.current} for channel ${channelId}`
    );
  });

  // WebSocket client integration
  const {
    status,
    error,
    sendMessage: wsSendMessage,
    sendTyping: wsSendTyping,
    addReaction,
    removeReaction,
  } = WebSocketClient({
    channelId,
    onMessagesReceived: handleMessagesReceived,
    onUserJoined: () => {}, // Empty function to avoid null checks
    onUserLeft: handleUserLeft,
    onTyping: handleTyping,
  });

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create a stable typing handler with debounce
  const debouncedTypingHandler = useCallback(
    debounce((isTyping: boolean) => {
      console.log("Sending typing indicator:", isTyping);
      wsSendTyping(isTyping);
    }, 300),
    [wsSendTyping]
  );

  // Handle input changes with typing indicator
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);

      // If not already marked as typing, send typing indicator
      if (!isTyping) {
        setIsTyping(true);
        debouncedTypingHandler(true);
      }

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        debouncedTypingHandler(false);
      }, 2000);
    },
    [isTyping, debouncedTypingHandler]
  );

  // Handle sending messages with a stable reference
  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (input.trim() && status === "connected") {
        // Send the message via WebSocket
        wsSendMessage(input.trim());

        // Clear input and typing state
        setInput("");
        setIsTyping(false);
        debouncedTypingHandler(false);

        // Clear typing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
    },
    [input, status, wsSendMessage, debouncedTypingHandler]
  );

  // Clean up typing timeout on unmount or channel change
  useEffect(() => {
    return () => {
      console.log(
        "Cleaning up ChannelMessages for channel",
        channelIdRef.current
      );
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      // Clear typing indicator on unmount
      if (isTyping) {
        debouncedTypingHandler(false);
      }
    };
  }, [debouncedTypingHandler, isTyping]);

  // Handle file upload
  const handleFileUpload = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      // In a real app, you would upload the file to your backend first,
      // then send a message with the file attachment info
      console.log("Files selected:", files);

      // Mock implementation: Just send a message mentioning the file
      wsSendMessage(`Attached file: ${files[0].name}`);
    },
    [wsSendMessage]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Connection status indicator */}
      {status !== "connected" && (
        <div
          className={`p-2 text-center text-sm ${
            status === "connecting"
              ? "bg-yellow-100"
              : status === "error"
              ? "bg-red-100"
              : "bg-gray-100"
          }`}
        >
          {status === "connecting"
            ? "Connecting..."
            : status === "error"
            ? `Error: ${error}`
            : "Disconnected"}
        </div>
      )}

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">No messages yet</div>
        ) : (
          messages.map((msg) => (
            <Message
              key={msg.id}
              message={msg}
              currentUserId={currentUserId}
              onReactionAdd={addReaction}
              onReactionRemove={removeReaction}
            />
          ))
        )}

        {/* Typing indicator */}
        <TypingIndicator typingUsers={typingUsers} />

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="border-t p-3 bg-white">
        <div className="flex">
          {/* File attachment button */}
          <label
            htmlFor="file-upload"
            className="cursor-pointer p-2 text-gray-600 hover:text-gray-800"
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
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </label>

          {/* Text input */}
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={status !== "connected"}
          />

          {/* Send button */}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg disabled:bg-blue-300"
            disabled={!input.trim() || status !== "connected"}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChannelMessages;
