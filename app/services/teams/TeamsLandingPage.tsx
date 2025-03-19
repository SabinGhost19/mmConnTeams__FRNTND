"use client";
import React, { useState } from "react";
import Head from "next/head";
import TeamsOverview from "./components/TeamsOverview";
import TeamsSidebar from "./components/TeamsSidebar";
import CreateChannelModal from "./components/CreateChannelModal";
import InviteUserModal from "./components/InviteUserModal";
import CreateTeamModal from "./components/CreateTeamModal";
import TeamDetailView from "./components/TeamDetailView";
// Mock data
import { mockTeams, mockUsers, mockEvents, mockFiles } from "./teams-Mock";
import { UserTeam } from "@/app/types/models_types/userType";
import Team from "@/app/types/models_types/team";
import Event from "@/app/types/models_types/event";
import File from "@/app/types/models_types/file";
import Channel from "@/app/types/models_types/channel";

interface TeamsLandingPageProps {
  initialTeams: Team[];
  initialUsers: UserTeam[];
  initialEvents: Event[];
  initialFiles: File[];
}

// Tipul pentru datele necesare la crearea unei echipe
interface TeamData {
  name: string;
  icon: string;
  description: string;
}

// Tipul pentru datele necesare la crearea unui canal
interface ChannelData {
  name: string;
  description: string;
}

// Tipul pentru datele unei invitații
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
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.OVERVIEW);
  const [selectedView, setSelectedView] = useState<string>("overview");

  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showInviteUserModal, setShowInviteUserModal] = useState(false);

  // Handlers
  const handleSelectTeam = (teamId: number) => {
    const team = teams.find((t: Team) => t.id === teamId);
    if (team) {
      setSelectedTeam(team);
      setCurrentView(ViewType.TEAM_DETAIL);

      if (team.channels.length > 0) {
        setSelectedChannel(team.channels[0]);
      }
    }
  };

  const handleSelectChannel = (channelId: number) => {
    if (!selectedTeam) return;

    const channel = selectedTeam.channels.find(
      (c: Channel) => c.id === channelId
    );
    if (channel) {
      setSelectedChannel(channel);
      setCurrentView(ViewType.CHANNEL);
    }
  };

  const handleStartChat = (userId: number) => {
    // În loc să navigăm către o pagină nouă, setăm selectedUserId și schimbăm view-ul
    setSelectedUserId(userId);
    setCurrentView(ViewType.CHAT);
  };

  const handleJoinChannel = (teamId: number, channelId: number) => {
    // Întâi selectăm echipa
    const team = teams.find((t: Team) => t.id === teamId);
    if (team) {
      setSelectedTeam(team);

      // Apoi selectăm canalul din echipa respectivă
      const channel = team.channels.find((c: Channel) => c.id === channelId);
      if (channel) {
        setSelectedChannel(channel);
        setCurrentView(ViewType.CHANNEL);
      }
    }
  };

  const handleCreateTeam = (teamData: TeamData) => {
    const newTeam: Team = {
      id: Date.now(),
      ...teamData,
      members: [1], // presupunem că utilizatorul curent are ID-ul 1
      unreadCount: 0,
      channels: [{ id: Date.now() + 1, name: "General", unreadCount: 0 }],
    };

    setTeams([...teams, newTeam]);
    setShowCreateTeamModal(false);

    // Selectăm automat noua echipă
    setSelectedTeam(newTeam);
    setSelectedChannel(newTeam.channels[0]);
    setCurrentView(ViewType.TEAM_DETAIL);
  };

  const handleCreateChannel = (channelData: ChannelData) => {
    if (!selectedTeam) return;

    const newChannel: Channel = {
      id: Date.now(),
      ...channelData,
      unreadCount: 0,
    };

    // Actualizează team-ul selectat cu noul canal
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

    // Actualizează și selectedTeam
    if (selectedTeam) {
      const updatedTeam = {
        ...selectedTeam,
        channels: [...selectedTeam.channels, newChannel],
      };
      setSelectedTeam(updatedTeam);

      // Selectăm automat noul canal
      setSelectedChannel(newChannel);
      setCurrentView(ViewType.CHANNEL);
    }

    setShowCreateChannelModal(false);
  };

  const handleInviteUser = (inviteData: InviteData) => {
    // În implementarea reală, aici ai trimite invitația la backend
    console.log("Invitație trimisă la:", inviteData.email);
    setShowInviteUserModal(false);
  };

  // Funcție pentru a naviga înapoi la overview
  const handleBackToOverview = () => {
    setSelectedTeam(null);
    setSelectedChannel(null);
    setSelectedUserId(null);
    setCurrentView(ViewType.OVERVIEW);
  };

  // Render funcție pentru conținutul principal bazat pe currentView
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
          />
        );

      case ViewType.CHANNEL:
        if (!selectedTeam || !selectedChannel) return null;
        return (
          <div className="p-4">
            <div className="flex items-center mb-4">
              <button
                onClick={() => setCurrentView(ViewType.TEAM_DETAIL)}
                className="mr-2 text-blue-500"
              >
                ← Înapoi la echipă
              </button>
              <h2 className="text-2xl font-bold">
                {selectedTeam.name} / {selectedChannel.name}
              </h2>
            </div>
            {/* Aici ar veni componentele pentru afișarea mesajelor din canal, etc. */}
            <div className="bg-gray-100 p-4 rounded">
              <p>
                Conținutul canalului {selectedChannel.name} din echipa{" "}
                {selectedTeam.name}
              </p>
              {/* Componentele pentru chat, fișiere, etc. ar veni aici */}
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
          content="Gestionează echipele, canalele și colaborarea în cadrul organizației tale"
        />
        <meta name="darkreader-lock" content="true" />
      </Head>

      <div className="flex h-screen bg-white overflow-hidden">
        {/* Sidebar */}
        <TeamsSidebar
          teams={teams}
          selectedTeamId={selectedTeam?.id as number}
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
