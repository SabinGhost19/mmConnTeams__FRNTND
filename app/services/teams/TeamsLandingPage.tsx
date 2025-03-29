"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import TeamsOverview from "./components/TeamsOverview";
import TeamsSidebar from "./components/TeamsSidebar";
import CreateChannelModal from "./components/CreateChannelModal";
import InviteUserModal from "./components/InviteUserModal";
import CreateTeamModal from "./components/CreateTeamModal";
import TeamDetailView from "./components/TeamDetailView";
import { api as axios } from "@/app/lib/api";
import { UserTeam } from "@/app/types/models_types/userType";
import Team from "@/app/types/models_types/team";
import Event from "@/app/types/models_types/event";
import File from "@/app/types/models_types/file";
import Channel from "@/app/types/models_types/channel";
import ChannelHeader from "../chat/components/ChatHeader";
import ChatArea from "../chat/components/ChatArea";

interface TeamsLandingPageProps {
  initialTeams: Team[];
  initialUsers: UserTeam[];
  initialEvents: Event[];
  initialFiles: File[];
}

interface TeamData {
  name: string;
  icon: string;
  description: string;
}

// Tipul pentru datele necesare la crearea unui canal
interface ChannelData {
  name: string;
  description: string;
  isPrivate: boolean;
}

//for request it contain user id and team id
//for getting the name of the team in the db
interface InviteData {
  email: string;
  role: string;
  message: string;
}

// Enum pentru a gestiona diferitele view-uri posibile
enum ViewType {
  OVERVIEW = "overview",
  TEAM_DETAIL = "team_detail",
  CHANNEL = "channel",
  CHAT = "chat",
}

const TeamsLandingPage: React.FC<TeamsLandingPageProps> = ({
  initialTeams,
  initialUsers,
  initialEvents,
  initialFiles,
}) => {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [users, setUsers] = useState<UserTeam[]>(initialUsers);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [files, setFiles] = useState<File[]>(initialFiles);

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.OVERVIEW);
  const [selectedView, setSelectedView] = useState<string>("overview");

  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showInviteUserModal, setShowInviteUserModal] = useState(false);
  const onFileUpload = () => {};
  const onEnterTeamById = async (teamId: string) => {
    try {
      console.log("TeamId: ", teamId);

      const response = await axios.put(
        "/api/teams/enter",
        { teamId }, // Send as an object, not raw string
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Eroare la intrarea în echipă:", error);
      throw error;
    }
  };
  useEffect(() => {
    setTeams(initialTeams);
  }, [initialTeams]);

  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);

  const fetchTeamMembers = async (teamId: string): Promise<UserTeam[]> => {
    const response = await axios.get<UserTeam[]>(`/api/users/teams/${teamId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  };

  const handleSelectTeam = async (teamId: string) => {
    setLoadingTeamMembers(true);
    try {
      const team = teams.find((t: Team) => t.id === teamId);
      if (!team) return;

      setSelectedTeam(team);
      setCurrentView(ViewType.TEAM_DETAIL);
      setSelectedChannel(team.channels[0] || null);

      const members = await fetchTeamMembers(teamId);
      setUsers(members);
    } catch (error) {
      console.error("Error loading team:", error);
    } finally {
      setLoadingTeamMembers(false);
    }
  };

  const handleSelectChannel = (channelId: string) => {
    if (!selectedTeam) return;
    //request -------------------------
    //depinde daca facem sus cum trebuie si luam
    //si channels
    const channel = selectedTeam.channels.find(
      (c: Channel) => c.id === channelId
    );
    if (channel) {
      setSelectedChannel(channel);
      setCurrentView(ViewType.CHANNEL);
    }
  };

  const handleStartChat = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentView(ViewType.CHAT);
  };

  const handleJoinChannel = (teamId: string, channelId: string) => {
    const team = teams.find((t: Team) => t.id === teamId);
    if (team) {
      setSelectedTeam(team);

      const channel = team.channels.find((c: Channel) => c.id === channelId);
      if (channel) {
        setSelectedChannel(channel);
        setCurrentView(ViewType.CHANNEL);
      }
    }
  };

  const handleCreateTeam = (teamData: TeamData) => {
    // Folosim Date.now().toString() pentru ID-uri unice temporare
    const timestamp = Date.now().toString();

    const newTeam: Team = {
      id: timestamp, // ID-ul echipei ca string
      ...teamData,
      members: ["1"], // Array de string-uri (ID-uri utilizator)
      unreadCount: 0,
      channels: [
        {
          id: (Date.now() + 1).toString(), // ID canal ca string
          name: "General",
          unreadCount: 0,
          description: "",
          isPrivate: false,
          teamId: timestamp,
        },
      ],
    };

    // Aici ar trebui să faci request POST către backend
    setTeams([...teams, newTeam]);

    setShowCreateTeamModal(false);

    // Selectăm automat noua echipă
    setSelectedTeam(newTeam);
    setSelectedChannel(newTeam.channels[0]);
    setCurrentView(ViewType.TEAM_DETAIL);
  };

  const handleCreateChannel = async (channelData: ChannelData) => {
    if (!selectedTeam) return;

    try {
      // Trimite datele către backend
      const response = await axios.get<Channel>(
        `/api/teams/${selectedTeam.id}/channels`
      );

      const newChannel = response.data;

      // Actualizează starea locală cu răspunsul de la backend
      const updatedTeams = teams.map((team: Team) => {
        if (team.id === selectedTeam.id) {
          return {
            ...team,
            channels: [...team.channels, newChannel],
          };
        }
        return team;
      });

      setTeams(updatedTeams);
      setSelectedTeam({
        ...selectedTeam,
        channels: [...selectedTeam.channels, newChannel],
      });
      setSelectedChannel(newChannel);
      setCurrentView(ViewType.CHANNEL);
    } catch (error) {
      console.error("Error creating channel:", error);
      // Poți adăuga aici notificare pentru utilizator
    } finally {
      setShowCreateChannelModal(false);
    }
  };

  const handleInviteUser = (inviteData: InviteData) => {
    ////request -------------------------POST ..send Invite
    console.log("Invitație trimisă la:", inviteData.email);
    setShowInviteUserModal(false);
  };

  const handleBackToOverview = () => {
    setSelectedTeam(null);
    setSelectedChannel(null);
    setSelectedUserId(null);
    setCurrentView(ViewType.OVERVIEW);
  };

  const [messages, setMessages] = useState<any[]>([]);

  const generateMockMessages = (channelId: string) => {
    return [
      {
        id: `${channelId}-1`,
        sender: users[0],
        content: "Bună tuturor! Acesta este primul mesaj în acest canal.",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        attachments: [],
        reactions: [],
        isRead: true,
      },
      {
        id: `${channelId}-2`,
        sender: users[1],
        content: "Salut! Mă bucur să fim cu toții aici.",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        attachments: [],
        reactions: [],
        isRead: true,
      },
    ];
  };

  useEffect(() => {
    ////request -------------------------GET ..all messages
    console.log("Teams: ...", teams);
    if (selectedChannel) {
      setMessages(generateMockMessages(selectedChannel.id));
    }
  }, [selectedChannel]);

  const handleSendMessage = (content: string, attachments: any[] = []) => {
    if (!selectedChannel) return;

    const newMessage = {
      id: `${selectedChannel.id}-${Date.now()}`,
      sender: users[0],
      content,
      timestamp: new Date().toISOString(),
      attachments,
      reactions: [],
      isRead: true,
    };
    ////request -------------------------POST ..send new MESSAGE
    setMessages([...messages, newMessage]);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    ////request -------------------------POST ..send new Emoji
    setMessages(
      messages.map((message) => {
        if (message.id === messageId) {
          const existingReactionIndex = message.reactions.findIndex(
            (r: any) => r.emoji === emoji
          );

          if (existingReactionIndex > -1) {
            // Toggle reaction
            // (logica similară cu cea din exemplul tău)
            return message; // Simplificat pentru exemplu
          } else {
            // Add new reaction
            return {
              ...message,
              reactions: [
                ...message.reactions,
                { emoji, count: 1, users: [users[0].id] },
              ],
            };
          }
        }
        return message;
      })
    );
  };
  //--------------------------------------------

  const renderMainContent = () => {
    switch (currentView) {
      case ViewType.TEAM_DETAIL:
        if (!selectedTeam) return null;
        return (
          <TeamDetailView
            team={selectedTeam}
            users={users}
            events={events.filter((e) => e.teamId === selectedTeam.id)}
            files={files.filter((f) => f.teamId === selectedTeam.id)}
            selectedView={selectedView}
            onChangeView={setSelectedView}
            onStartChat={handleStartChat}
            onJoinChannel={handleJoinChannel}
            onCreateChannel={() => setShowCreateChannelModal(true)}
            onInviteUser={() => setShowInviteUserModal(true)}
            onSelectChannel={handleSelectChannel}
            onEnterTeamById={onEnterTeamById}
          />
        );

      case ViewType.CHANNEL:
        if (!selectedTeam || !selectedChannel) return null;

        // Obține mesajele pentru canalul selectat
        const channelMessages =
          messages.filter(
            (message: { channelId: string }) =>
              message.channelId === selectedChannel.id
          ) || [];

        // Calculează numărul de utilizatori online
        console.log("Users data:", users);
        console.log("Type of users:", typeof users);
        const onlineUsersCount = Array.isArray(users)
          ? users.filter((user) => user?.status === "online").length
          : 0;
        return (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center p-4 border-b border-gray-200">
              <button
                onClick={() => setCurrentView(ViewType.TEAM_DETAIL)}
                className="mr-2 text-blue-500 hover:text-blue-700"
              >
                ← Înapoi la echipă
              </button>
              <h2 className="text-xl font-bold">
                {selectedTeam.name} / {selectedChannel.name}
              </h2>
            </div>

            <div className="flex flex-col flex-1 overflow-hidden">
              <ChannelHeader
                team={selectedTeam}
                channel={selectedChannel}
                onlineUsers={onlineUsersCount}
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
                onFileUpload={onFileUpload}
              />
            </div>
          </div>
        );

      case ViewType.CHAT:
        const chatUser = users.find((u) => u.id === selectedUserId);
        if (!chatUser) return null;
        return (
          <div className="p-4">
            <div className="flex items-center mb-4">
              <button
                onClick={() =>
                  selectedTeam
                    ? setCurrentView(ViewType.TEAM_DETAIL)
                    : handleBackToOverview()
                }
                className="mr-2 text-blue-500"
              >
                ← Înapoi
              </button>
              <h2 className="text-2xl font-bold">Chat cu {chatUser.name}</h2>
            </div>
            {/* Aici ar veni componenta de chat */}
            <div className="bg-gray-100 p-4 rounded">
              <p>Fereastra de chat cu {chatUser.name}</p>
              {/* Componenta de chat ar veni aici */}
            </div>
          </div>
        );

      case ViewType.OVERVIEW:
      default:
        return (
          <TeamsOverview
            teams={teams}
            users={users}
            events={events}
            onSelectTeam={handleSelectTeam}
            onStartChat={handleStartChat}
            onJoinChannel={handleJoinChannel}
            onCreateTeam={() => setShowCreateTeamModal(true)}
            onEnterTeamById={onEnterTeamById}
          />
        );
    }
  };

  return (
    <>
      <Head>
        <title>Teams - Colaborare | Aplicația Ta</title>
        <meta
          name="description"
          content="Gestionează echipele,  ele și colaborarea în cadrul organizației tale"
        />
        <meta name="darkreader-lock" content="true" />
      </Head>

      <div className="flex h-screen bg-white overflow-hidden">
        {/* Sidebar */}
        <TeamsSidebar
          teams={teams}
          selectedTeamId={selectedTeam?.id as string}
          onSelectTeam={handleSelectTeam}
          onCreateTeam={() => setShowCreateTeamModal(true)}
          onBackToOverview={handleBackToOverview}
        />

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {renderMainContent()}
        </div>
      </div>

      {/* Modals */}
      {showCreateTeamModal && (
        <CreateTeamModal
          onClose={() => setShowCreateTeamModal(false)}
          onSubmit={handleCreateTeam}
        />
      )}

      {showCreateChannelModal && selectedTeam && (
        <CreateChannelModal
          teamId={selectedTeam.id}
          onClose={() => setShowCreateChannelModal(false)}
          onSubmit={handleCreateChannel}
        />
      )}

      {showInviteUserModal && selectedTeam && (
        <InviteUserModal
          teamId={selectedTeam.id}
          teamName={selectedTeam.name}
          onClose={() => setShowInviteUserModal(false)}
          onSubmit={handleInviteUser}
        />
      )}
    </>
  );
};

export default TeamsLandingPage;
