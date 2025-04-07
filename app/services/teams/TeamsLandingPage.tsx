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

// Interface pentru datele de editare a canalului
interface EditChannelData {
  name: string;
  description: string;
}

const TeamsLandingPage: React.FC<TeamsLandingPageProps> = ({
  initialTeams,
  initialUsers,
  initialEvents,
  initialFiles,
}) => {
  const router = useRouter();
  const { user: currentUser } = useAuth(); // Obținem utilizatorul curent
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
  const [showEditChannelModal, setShowEditChannelModal] = useState(false);
  const [editChannelData, setEditChannelData] = useState<EditChannelData>({
    name: "",
    description: "",
  });
  const [isUpdatingChannel, setIsUpdatingChannel] = useState(false);

  const onFileUpload = async (
    file: Blob,
    teamId: string,
    channelId: string
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("team_id", teamId);
      formData.append("channel_id", channelId);

      const response = await axios.post(
        "/api/files/upload/explicit",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("File uploaded successfully:", response.data);

      // Refresh the files list
      if (response.data) {
        // Fetch all files for the team after upload
        const filesResponse = await axios.get<File[]>(
          `/api/files/all/${teamId}`
        );
        if (filesResponse.data) {
          setFiles(filesResponse.data);
        }
      }

      return response.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
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

  const handleJoinChannel = (teamId: string, channelId: string) => {
    const team = teams.find((t: Team) => t.id === teamId);
    if (team) {
      setSelectedTeam(team);

      const channel = team.channels?.find((c: Channel) => c.id === channelId);
      if (channel) {
        setSelectedChannel(channel);
        setCurrentView(ViewType.CHANNEL);
      }
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

  const renderMainContent = () => {
    switch (currentView) {
      case ViewType.TEAM_DETAIL:
        if (!selectedTeam) return null;
        return (
          <TeamDetailView
            team={selectedTeam}
            users={users}
            events={(events || []).filter(
              (e) => e && e.teamId && e.teamId === selectedTeam.id
            )}
            files={(files || []).filter(
              (f) => f && f.teamId && f.teamId === selectedTeam.id
            )}
            selectedView={selectedView}
            onChangeView={setSelectedView}
            onStartChat={handleStartChat}
            onJoinChannel={handleJoinChannel}
            onCreateChannel={() => setShowCreateChannelModal(true)}
            onInviteUser={() => setShowInviteUserModal(true)}
            onSelectChannel={handleSelectChannel}
            onCreateEvent={handleCreateEvent}
            onEnterTeamById={onEnterTeamById}
            onFileUpload={onFileUpload}
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
          ? users.filter((user) => user?.status === "ONLINE").length
          : 0;

        // Verifică dacă utilizatorul curent este creatorul canalului
        const isChannelCreator = currentUser?.id === selectedChannel.creatorId;
        console.log("Current user ID:", currentUser?.id);
        console.log("Channel creator ID:", selectedChannel.creatorId);
        console.log("Is channel creator:", isChannelCreator);

        return (
          <div className="flex flex-col h-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* Header modern cu efect de glassmorphism */}
            <div className="flex items-center p-4 backdrop-blur-md bg-white/70 border-b border-gray-200 shadow-sm">
              <button
                onClick={() => setCurrentView(ViewType.TEAM_DETAIL)}
                className="mr-4 p-2 rounded-full text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 transition-all duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div className="flex items-center">
                <div className="relative">
                  <span className="absolute inset-0 rounded-md bg-indigo-500 opacity-10"></span>
                  <span className="relative flex h-3 w-3 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedTeam.name}{" "}
                  <span className="text-indigo-500 mx-2">/</span>{" "}
                  <span className="font-semibold">{selectedChannel.name}</span>
                </h2>
              </div>

              <div className="ml-auto flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {Array.isArray(users) &&
                    users.slice(0, 3).map((user, index) => (
                      <div key={index} className="relative">
                        <img
                          src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=0D8ABC&color=fff`}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-8 h-8 rounded-full border-2 border-white"
                        />
                        {user.status === "ONLINE" && (
                          <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-1 ring-white"></span>
                        )}
                      </div>
                    ))}
                  {Array.isArray(users) && users.length > 3 && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium border-2 border-white">
                      +{users.length - 3}
                    </div>
                  )}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  <span className="text-green-500">{onlineUsersCount}</span> /{" "}
                  {Array.isArray(users) ? users.length : 0} online
                </div>
              </div>
            </div>

            {/* Conținut principal - placehoder elegant */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
              <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
                <div className="inline-flex p-4 mb-6 rounded-full bg-indigo-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Canalul {selectedChannel.name}
                </h3>
                <p className="text-gray-600 mb-6">
                  Acest canal are {channelMessages.length} mesaje și{" "}
                  {Array.isArray(users) ? users.length : 0} membri. Conținutul
                  canalului este dezactivat momentan.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setEditChannelData({
                        name: selectedChannel.name,
                        description: selectedChannel.description,
                      });
                      setShowEditChannelModal(true);
                    }}
                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Editare canal
                  </button>

                  {/* Afișează butonul de administrare canal doar dacă utilizatorul curent este creatorul canalului */}
                  {isChannelCreator && (
                    <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Administrare canal
                    </button>
                  )}

                  <button className="w-full py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition duration-200 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Administrare membri
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case ViewType.CHAT:
        // Since we're redirecting, this shouldn't be rendered
        // but we'll keep it as a fallback
        const chatUser = users.find((u) => u.id === selectedUserId);
        if (!chatUser) return null;

        // Redirect to chat page
        router.push(`/chat?userId=${selectedUserId}`);

        // Return loading state while redirecting
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div
                className="spinner-border inline-block w-8 h-8 border-4 rounded-full text-blue-600 mb-4"
                role="status"
              >
                <span className="visually-hidden">Redirecting...</span>
              </div>
              <p>Se redirecționează către chat...</p>
            </div>
          </div>
        );

      case ViewType.OVERVIEW:
      default:
        return (
          <TeamsOverview
            teams={teams}
            users={users}
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
          {/* Main content will be rendered here */}
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

      {/* Modal pentru editarea canalului */}
      {showEditChannelModal && selectedChannel && (
        <EditChannelModal
          channel={selectedChannel}
          onClose={() => setShowEditChannelModal(false)}
          onSubmit={handleUpdateChannel}
          isUpdating={isUpdatingChannel}
        />
      )}
    </>
  );
};

export default TeamsLandingPage;
