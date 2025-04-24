"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import TeamsOverview from "./components/TeamsOverview";
import TeamsSidebar from "./components/TeamsSidebar";
import CreateChannelModal from "./components/CreateChannelModal";
import InviteUserModal from "./components/InviteUserModal";
import CreateTeamModal from "./components/CreateTeamModal";
import TeamDetailView from "./components/TeamDetailView";
import EditChannelModal from "./components/EditChannelModal";
import { api as axios } from "@/app/lib/api";
import { UserTeam } from "@/app/types/models_types/userType";
import Team from "@/app/types/models_types/team";
import Event from "@/app/types/models_types/event";
import File from "@/app/types/models_types/file";
import Channel from "@/app/types/models_types/channel";
import ChannelHeader from "../chat/components/ChatHeader";
import { NewEventWithAttendees } from "@/app/types/models_types/eventTypes";
import { createEvent } from "@/app/services/api/eventService";
import { createBackwardCompatibleUser } from "@/app/lib/userUtils";
import { useAuth } from "@/app/contexts/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import {
  FiUsers,
  FiMessageSquare,
  FiCalendar,
  FiFile,
  FiPlus,
  FiChevronRight,
} from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";

// Enum pentru a gestiona diferitele view-uri posibile
export enum ViewType {
  OVERVIEW = "overview",
  TEAM_DETAIL = "team_detail",
  CHANNEL = "channel",
  CHAT = "chat",
  FILES = "files",
}

interface TeamsLandingPageProps {
  initialTeams: Team[];
  initialUsers: UserTeam[];
  initialEvents: Event[];
  initialFiles: BackendFile[];
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

// Interface pentru datele de editare a canalului
interface EditChannelData {
  name: string;
  description: string;
}

interface BackendFile {
  id: string;
  teamId: string;
  channelId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedById: string;
  uploadedAt: string;
  url: string;
}

const TeamsLandingPage: React.FC<TeamsLandingPageProps> = ({
  initialTeams,
  initialUsers,
  initialEvents,
  initialFiles,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [users, setUsers] = useState<UserTeam[]>(initialUsers);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [files, setFiles] = useState<BackendFile[]>(initialFiles);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedView, setSelectedView] = useState<ViewType>(ViewType.OVERVIEW);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.OVERVIEW);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showInviteUserModal, setShowInviteUserModal] = useState(false);
  const [showEditChannelModal, setShowEditChannelModal] = useState(false);
  const [isUpdatingChannel, setIsUpdatingChannel] = useState(false);
  const [editChannelData, setEditChannelData] = useState<{
    name: string;
    description: string;
  }>({ name: "", description: "" });

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  const [teamFiles, setTeamFiles] = useState<BackendFile[]>([]);

  const onFileUpload = async (
    file: Blob,
    teamId: string,
    channelId: string
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("teamId", teamId);
      formData.append("channelId", channelId);

      const response = await axios.post<BackendFile>(
        "/api/files/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setFiles((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

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
    console.log(`Fetching team members for team with ID: ${teamId}`);
    try {
      const response = await axios.get<UserTeam[]>(
        `/api/users/teams/${teamId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("MEMBRI EXTRAȘI DIN BAZA DE DATE (raw response):", response);
      console.log("MEMBRI EXTRAȘI DIN BAZA DE DATE (data):", response.data);
      console.log("MEMBRI EXTRAȘI DIN BAZA DE DATE (date detaliate):");
      response.data.forEach((user, index) => {
        console.log(`User ${index + 1}:`, {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          status: user.status,
          roles: user.roles,
          department: user.department,
          profileImage: user.profileImage,
          // Adăugă orice alte câmpuri vrei să vezi
        });
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching team members:", error);
      throw error;
    }
  };

  const handleSelectTeam = async (teamId: string) => {
    setLoadingTeamMembers(true);
    try {
      const team = teams.find((t: Team) => t.id === teamId);
      if (!team) return;

      setSelectedTeam(team);
      setCurrentView(ViewType.TEAM_DETAIL);
      setSelectedChannel(team?.channels?.[0] || null);

      const members = await fetchTeamMembers(teamId);
      const backwardCompatibleMembers = members.map(
        createBackwardCompatibleUser
      );
      setUsers(backwardCompatibleMembers);
    } catch (error) {
      console.error("Error loading team:", error);
    } finally {
      setLoadingTeamMembers(false);
    }
  };

  const handleSelectChannel = (channelId: string) => {
    if (!selectedTeam) return;
    //request -------------------------
    const channel = selectedTeam?.channels?.find(
      (c: Channel) => c.id === channelId
    );
    if (channel) {
      setSelectedChannel(channel);
      setCurrentView(ViewType.CHANNEL);
    }
  };

  const handleStartChat = (userId: string) => {
    setSelectedUserId(userId);
    // Redirect to chat page with the user ID as query parameter
    router.push(`/chat?userId=${userId}`);
  };

  const handleJoinChannel = async (teamId: string, channelId: string) => {
    try {
      await axios.post(`/api/teams/${teamId}/channels/${channelId}/join`);
      // Refresh team data
      const response = await axios.get<Team>(`/api/teams/${teamId}`);
      setSelectedTeam(response.data);
    } catch (error) {
      console.error("Error joining channel:", error);
    }
  };

  const handleCreateTeam = (teamData: TeamData) => {
    // Folosim Date.now().toString() pentru ID-uri unice temporare
    const timestamp = Date.now().toString();

    // First create as unknown then cast to Team
    const newTeam = {
      id: timestamp,
      ...teamData,
      members: ["1"],
      unreadCount: 0,
      channels: [
        {
          id: (Date.now() + 1).toString(),
          name: "General",
          unreadCount: 0,
          description: "",
          isPrivate: false,
          teamId: timestamp,
        },
      ],
      // Add missing required properties with default values
      iconUrl: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageNr: 0,
      messageLastTime: new Date().toISOString(),
      isActive: true,
      reactionNr: 0,
      channelNr: 1,
    } as unknown as Team;

    // Aici ar trebui să faci request POST către backend
    setTeams([...teams, newTeam]);

    setShowCreateTeamModal(false);

    // Selectăm automat noua echipă
    setSelectedTeam(newTeam);
    setSelectedChannel(newTeam.channels?.[0] || null);
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
            channels: [...(team.channels || []), newChannel],
          };
        }
        return team;
      });

      setTeams(updatedTeams);
      setSelectedTeam({
        ...selectedTeam,
        channels: [...(selectedTeam.channels || []), newChannel],
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

  const handleCreateEvent = async (eventData: NewEventWithAttendees) => {
    try {
      console.log(
        "Creating event with data:",
        JSON.stringify(eventData, null, 2)
      );
      console.log("Event title:", eventData.event.title);
      console.log("Event description:", eventData.event.description);
      console.log("Event date:", eventData.event.eventDate);

      const response = await createEvent(eventData);
      console.log("Event creation response:", response);

      // Add the new event to the events state
      const newEvent = response.event;
      setEvents([...events, newEvent]);

      // Show success notification
      alert("Evenimentul a fost creat cu succes!");
    } catch (error) {
      console.error("Error creating event:", error);
      alert("A apărut o eroare la crearea evenimentului.");
    }
  };

  // Funcție pentru actualizarea canalului
  const handleUpdateChannel = async (channelData: EditChannelData) => {
    if (!selectedTeam || !selectedChannel) return;

    setIsUpdatingChannel(true);

    try {
      // Validează datele (opțional poți adăuga mai multe validări)
      if (!channelData.name.trim()) {
        alert("Numele canalului nu poate fi gol!");
        return;
      }

      // Trimite datele către server
      const response = await axios.put(
        `/api/teams/${selectedTeam.id}/channels/${selectedChannel.id}`,
        channelData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        const updatedChannel = response.data;

        // Actualizează starea canalului selectat
        setSelectedChannel(updatedChannel);

        // Actualizează starea echipei cu canalul modificat
        const updatedTeams = teams.map((team) => {
          if (team.id === selectedTeam.id) {
            return {
              ...team,
              channels: (team.channels || []).map((channel) =>
                channel.id === selectedChannel.id ? updatedChannel : channel
              ),
            };
          }
          return team;
        });

        setTeams(updatedTeams);

        // Actualizează starea echipei selectate
        setSelectedTeam({
          ...selectedTeam,
          channels: (selectedTeam.channels || []).map((channel) =>
            channel.id === selectedChannel.id ? updatedChannel : channel
          ),
        });

        // Închide modalul
        setShowEditChannelModal(false);

        // Notificare de succes
        alert("Canalul a fost actualizat cu succes!");
      }
    } catch (error) {
      console.error("Eroare la actualizarea canalului:", error);
      alert("A apărut o eroare la actualizarea canalului!");
    } finally {
      setIsUpdatingChannel(false);
    }
  };

  const handleChangeView = (view: ViewType) => {
    setSelectedView(view);
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedTeam) return;
    try {
      await axios.post(`/api/teams/${selectedTeam.id}/members`, { userId });
      // Refresh team data
      const response = await axios.get<Team>(`/api/teams/${selectedTeam.id}`);
      setSelectedTeam(response.data);
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeam) return;
    try {
      await axios.delete(`/api/teams/${selectedTeam.id}/members/${userId}`);
      // Refresh team data
      const response = await axios.get<Team>(`/api/teams/${selectedTeam.id}`);
      setSelectedTeam(response.data);
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const handleUpdateMemberRole = async (userId: string, role: string) => {
    if (!selectedTeam) return;
    try {
      await axios.put(`/api/teams/${selectedTeam.id}/members/${userId}/role`, {
        role,
      });
      // Refresh team data
      const response = await axios.get<Team>(`/api/teams/${selectedTeam.id}`);
      setSelectedTeam(response.data);
    } catch (error) {
      console.error("Error updating member role:", error);
    }
  };

  const handleUploadFile = async (file: BackendFile) => {
    try {
      const formData = new FormData();
      formData.append("file", file as any);
      formData.append("teamId", selectedTeam?.id || "");

      const response = await axios.post("/api/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setTeamFiles((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await axios.delete(`/api/files/${fileId}`);
      setTeamFiles((prev) => prev.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleDownloadFile = async (fileId: string) => {
    try {
      const response = await axios.get(`/api/files/download/${fileId}`, {
        responseType: "blob",
      });

      const file = teamFiles.find((f) => f.id === fileId);
      if (!file) return;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleShareFile = async (fileId: string) => {
    try {
      const file = teamFiles.find((f) => f.id === fileId);
      if (!file) return;

      // Implement file sharing logic here
      console.log("Sharing file:", file);
    } catch (error) {
      console.error("Error sharing file:", error);
    }
  };

  const handleScheduleEvent = async (event: Event) => {
    if (!selectedTeam) return;
    try {
      await axios.post(`/api/teams/${selectedTeam.id}/events`, event);
      // Refresh events
      const response = await axios.get<Event[]>(
        `/api/teams/${selectedTeam.id}/events`
      );
      setEvents(response.data);
    } catch (error) {
      console.error("Error scheduling event:", error);
    }
  };

  const handleUpdateEvent = async (
    eventId: string,
    updates: Partial<Event>
  ) => {
    if (!selectedTeam) return;
    try {
      await axios.put(
        `/api/teams/${selectedTeam.id}/events/${eventId}`,
        updates
      );
      // Refresh events
      const response = await axios.get<Event[]>(
        `/api/teams/${selectedTeam.id}/events`
      );
      setEvents(response.data);
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!selectedTeam) return;
    try {
      await axios.delete(`/api/teams/${selectedTeam.id}/events/${eventId}`);
      // Refresh events
      const response = await axios.get<Event[]>(
        `/api/teams/${selectedTeam.id}/events`
      );
      setEvents(response.data);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    if (!selectedTeam) return;
    try {
      await axios.post(`/api/teams/${selectedTeam.id}/events/${eventId}/join`);
      // Refresh events
      const response = await axios.get<Event[]>(
        `/api/teams/${selectedTeam.id}/events`
      );
      setEvents(response.data);
    } catch (error) {
      console.error("Error joining event:", error);
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    if (!selectedTeam) return;
    try {
      await axios.post(`/api/teams/${selectedTeam.id}/events/${eventId}/leave`);
      // Refresh events
      const response = await axios.get<Event[]>(
        `/api/teams/${selectedTeam.id}/events`
      );
      setEvents(response.data);
    } catch (error) {
      console.error("Error leaving event:", error);
    }
  };

  const handleEnterTeam = async (teamId: string) => {
    try {
      await axios.post(`/api/teams/${teamId}/join`);
      // Refresh teams
      const response = await axios.get<Team[]>("/api/teams");
      setTeams(response.data);
    } catch (error) {
      console.error("Error entering team:", error);
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    try {
      await axios.post(`/api/teams/${teamId}/leave`);
      // Refresh teams
      const response = await axios.get<Team[]>("/api/teams");
      setTeams(response.data);
      setSelectedTeam(null);
    } catch (error) {
      console.error("Error leaving team:", error);
    }
  };

  const handleUpdateTeam = async (updates: Partial<Team>) => {
    if (!selectedTeam) return;
    try {
      await axios.put(`/api/teams/${selectedTeam.id}`, updates);
      // Refresh team data
      const response = await axios.get<Team>(`/api/teams/${selectedTeam.id}`);
      setSelectedTeam(response.data);
    } catch (error) {
      console.error("Error updating team:", error);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await axios.delete(`/api/teams/${teamId}`);
      // Refresh teams
      const response = await axios.get<Team[]>("/api/teams");
      setTeams(response.data);
      setSelectedTeam(null);
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  const renderMainContent = () => {
    switch (currentView) {
      case ViewType.TEAM_DETAIL:
        return selectedTeam ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TeamDetailView
              team={selectedTeam}
              users={users}
              events={events}
              files={files}
              selectedView={selectedView}
              onChangeView={handleChangeView}
              onSelectChannel={handleSelectChannel}
              onJoinChannel={handleJoinChannel}
              onCreateChannel={() => setShowCreateChannelModal(true)}
              onInviteUser={() => setShowInviteUserModal(true)}
              onStartChat={handleStartChat}
              onCreateEvent={handleCreateEvent}
              onFileUpload={onFileUpload}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              onUpdateMemberRole={handleUpdateMemberRole}
              onUploadFile={handleUploadFile}
              onDeleteFile={handleDeleteFile}
              onShareFile={handleShareFile}
              onScheduleEvent={handleScheduleEvent}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
              onJoinEvent={handleJoinEvent}
              onLeaveEvent={handleLeaveEvent}
              onEnterTeam={handleEnterTeam}
              onLeaveTeam={handleLeaveTeam}
              onUpdateTeam={handleUpdateTeam}
              onDeleteTeam={handleDeleteTeam}
              onDownloadFile={handleDownloadFile}
            />
          </motion.div>
        ) : null;
      case ViewType.CHANNEL:
        return selectedChannel ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChannelHeader
              team={selectedTeam}
              channel={selectedChannel}
              onlineUsers={users.filter((u) => u.status === "ONLINE").length}
              totalUsers={users.length}
            />
            {/* Add your channel content here */}
          </motion.div>
        ) : null;
      case ViewType.OVERVIEW:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <TeamsOverview
              teams={teams}
              users={users}
              teamFiles={files}
              onSelectTeam={handleSelectTeam}
              onStartChat={handleStartChat}
              onJoinChannel={handleJoinChannel}
              onCreateTeam={() => setShowCreateTeamModal(true)}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Teams | Modern Collaboration Platform</title>
        <meta
          name="description"
          content="Collaborate with your team members efficiently"
        />
      </Head>

      <div className="flex flex-col sm:flex-row h-screen overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed sm:relative z-30 w-full sm:w-72 h-full bg-white shadow-lg border-r border-gray-200`}
            >
              <TeamsSidebar
                teams={teams}
                selectedTeamId={selectedTeam?.id || null}
                onSelectTeam={handleSelectTeam}
                onCreateTeam={() => setShowCreateTeamModal(true)}
                onBackToOverview={handleBackToOverview}
                isMobile={isMobile}
                onClose={() => setIsSidebarOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          {isMobile && (
            <div className="flex items-center justify-between p-3 sm:p-4 bg-white border-b border-gray-200">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <BsThreeDotsVertical className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
                Teams
              </h1>
              <div className="w-10" /> {/* Spacer for alignment */}
            </div>
          )}

          {/* Main Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6"
          >
            {renderMainContent()}
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
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
            onInviteUser={handleInviteUser}
          />
        )}
        {showEditChannelModal && selectedChannel && (
          <EditChannelModal
            channel={selectedChannel}
            onClose={() => setShowEditChannelModal(false)}
            onSubmit={handleUpdateChannel}
            isUpdating={isUpdatingChannel}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamsLandingPage;
