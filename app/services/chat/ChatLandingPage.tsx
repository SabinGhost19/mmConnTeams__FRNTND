// components/TeamsChat/TeamsChat.tsx
"use client";
import React, { useState, useEffect } from "react";
import TeamsSidebar from "./components/TeamSidebar";
import ChatArea from "./components/ChatArea";
import ChannelHeader from "./components/ChatHeader";

// Mock data for teams and channels
const mockTeams = [
  {
    id: 1,
    name: "Echipa Marketing",
    icon: "📊",
    unreadCount: 3,
    channels: [
      { id: 101, name: "General", unreadCount: 1 },
      { id: 102, name: "Campanii 2025", unreadCount: 2 },
      { id: 103, name: "Social Media", unreadCount: 0 },
    ],
  },
  {
    id: 2,
    name: "Dezvoltare Produs",
    icon: "💻",
    unreadCount: 8,
    channels: [
      { id: 201, name: "General", unreadCount: 1 },
      { id: 202, name: "Frontend", unreadCount: 2 },
      { id: 203, name: "Backend", unreadCount: 5 },
      { id: 204, name: "Design", unreadCount: 0 },
    ],
  },
  {
    id: 3,
    name: "Resurse Umane",
    icon: "👥",
    unreadCount: 0,
    channels: [
      { id: 301, name: "General", unreadCount: 0 },
      { id: 302, name: "Recrutări", unreadCount: 0 },
      { id: 303, name: "Training", unreadCount: 0 },
    ],
  },
];

// Mock data for users
const mockUsers = [
  {
    id: 1,
    name: "Ana Popescu",
    avatar: "/avatars/user1.jpg",
    status: "online",
  },
  {
    id: 2,
    name: "Mihai Ionescu",
    avatar: "/avatars/user2.jpg",
    status: "offline",
  },
  {
    id: 3,
    name: "Cristina Dumitrescu",
    avatar: "/avatars/user3.jpg",
    status: "busy",
  },
  {
    id: 4,
    name: "Alexandru Popa",
    avatar: "/avatars/user4.jpg",
    status: "away",
  },
  {
    id: 5,
    name: "Elena Stancu",
    avatar: "/avatars/user5.jpg",
    status: "online",
  },
];

// Mock data for messages
const generateMockMessages = (channelId: number) => {
  const baseMessages = [
    {
      id: `${channelId}-1`,
      sender: mockUsers[0],
      content: "Bună tuturor! Am actualizat documentația pentru proiectul nou.",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      attachments: [],
      reactions: [{ emoji: "👍", count: 2, users: [2, 3] }],
      isRead: true,
    },
    {
      id: `${channelId}-2`,
      sender: mockUsers[2],
      content: "Mulțumesc Ana! Am verificat și totul arată bine.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      attachments: [],
      reactions: [],
      isRead: true,
    },
    {
      id: `${channelId}-3`,
      sender: mockUsers[1],
      content: "Am adăugat și eu câteva comentarii în documentație.",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      attachments: [
        { id: 1, name: "notes.pdf", type: "pdf", size: "2.4 MB", url: "#" },
      ],
      reactions: [{ emoji: "🙌", count: 1, users: [1] }],
      isRead: false,
    },
    {
      id: `${channelId}-4`,
      sender: mockUsers[4],
      content: "Super! Vom discuta mai multe în ședința de mâine.",
      timestamp: new Date(Date.now() - 900000).toISOString(),
      attachments: [],
      reactions: [],
      isRead: false,
    },
  ];

  // Add some channel-specific messages
  if (channelId === 202) {
    baseMessages.push({
      id: `${channelId}-5`,
      sender: mockUsers[3],
      content:
        "Tocmai am terminat de implementat noua componentă de UI. Funcționează perfect în toate browserele.",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      attachments: [
        { id: 2, name: "ui-demo.png", type: "image", size: "1.8 MB", url: "#" },
      ],
      reactions: [{ emoji: "🔥", count: 3, users: [0, 1, 4] }],
      isRead: false,
    });
  }

  if (channelId === 203) {
    baseMessages.push({
      id: `${channelId}-5`,
      sender: mockUsers[1],
      content:
        "API-ul nou este acum disponibil în staging. Puteți începe integrarea.",
      timestamp: new Date(Date.now() - 600000).toISOString(),
      attachments: [
        {
          id: 3,
          name: "api-docs.md",
          type: "markdown",
          size: "56 KB",
          url: "#",
        },
      ],
      reactions: [],
      isRead: false,
    });
  }

  return baseMessages;
};

const TeamsChat: React.FC = () => {
  const [teams, setTeams] = useState(mockTeams);
  const [selectedTeam, setSelectedTeam] = useState(mockTeams[0]);
  const [selectedChannel, setSelectedChannel] = useState(
    mockTeams[0].channels[0]
  );
  const [users, setUsers] = useState(mockUsers);
  const [messages, setMessages] = useState(
    generateMockMessages(mockTeams[0].channels[0].id)
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // When channel changes, load the corresponding messages
  useEffect(() => {
    setMessages(generateMockMessages(selectedChannel.id));
  }, [selectedChannel]);

  const handleTeamSelect = (teamId: number) => {
    const team = teams.find((t) => t.id === teamId);
    if (team) {
      setSelectedTeam(team);
      setSelectedChannel(team.channels[0]);
    }
  };

  const handleChannelSelect = (channelId: number) => {
    const channel = selectedTeam.channels.find((c) => c.id === channelId);
    if (channel) {
      setSelectedChannel(channel);
    }
  };

  const handleSendMessage = (content: any, attachments: any[] = []) => {
    const newMessage = {
      id: `${selectedChannel.id}-${Date.now()}`,
      sender: users[0], // Current user
      content,
      timestamp: new Date().toISOString(),
      attachments,
      reactions: [],
      isRead: true,
    };

    setMessages([...messages, newMessage]);

    // Update unread count (in a real app this would be done on the server)
    const updatedTeams = teams.map((team) => {
      if (team.id === selectedTeam.id) {
        const updatedChannels = team.channels.map((channel) => {
          if (channel.id === selectedChannel.id) {
            return { ...channel, unreadCount: 0 };
          }
          return channel;
        });
        return { ...team, channels: updatedChannels };
      }
      return team;
    });

    setTeams(updatedTeams);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    const updatedMessages = messages.map((message) => {
      if (message.id === messageId) {
        const existingReactionIndex = message.reactions.findIndex(
          (r) => r.emoji === emoji
        );

        if (existingReactionIndex > -1) {
          // Toggle reaction
          const currentUsers = message.reactions[existingReactionIndex].users;
          if (currentUsers.includes(1)) {
            const updatedUsers = currentUsers.filter((id) => id !== 1);
            if (updatedUsers.length === 0) {
              // Remove reaction if no users left
              const updatedReactions = message.reactions.filter(
                (r) => r.emoji !== emoji
              );
              return { ...message, reactions: updatedReactions };
            } else {
              // Update users and count
              const updatedReactions = [...message.reactions];
              updatedReactions[existingReactionIndex] = {
                ...updatedReactions[existingReactionIndex],
                users: updatedUsers,
                count: updatedUsers.length,
              };
              return { ...message, reactions: updatedReactions };
            }
          } else {
            // Add current user to reaction
            const updatedReactions = [...message.reactions];
            updatedReactions[existingReactionIndex] = {
              ...updatedReactions[existingReactionIndex],
              users: [...currentUsers, 1], // Add current user ID
              count: currentUsers.length + 1,
            };
            return { ...message, reactions: updatedReactions };
          }
        } else {
          // Add new reaction
          return {
            ...message,
            reactions: [...message.reactions, { emoji, count: 1, users: [1] }],
          };
        }
      }
      return message;
    });

    setMessages(updatedMessages);
  };

  return (
    <>
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
            currentUser={users[0]}
            users={users}
            onSendMessage={handleSendMessage}
            onReaction={handleReaction}
            teamName={selectedTeam.name}
            channelName={selectedChannel.name}
          />
        </div>
      </div>
    </>
  );
};

export default TeamsChat;
