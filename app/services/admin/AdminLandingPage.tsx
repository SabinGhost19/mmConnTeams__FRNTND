"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import { UserTeam } from "@/app/types/models_types/userType";
import Team from "@/app/types/models_types/team";
import Channel from "@/app/types/models_types/channel";
import { ROLE } from "@/app/types/models_types/roles";
import { Bar, Doughnut, Line, Pie, PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
);

interface DashboardStats {
  totalUsers: number;
  totalTeams: number;
  totalChannels: number;
  totalMessages: number;
  activeUsers: number;
  totalFiles: number;
  totalReactions: number;
}

interface ReactionStats {
  total: number;
  like: number;
  love: number;
  laugh: number;
  wow: number;
  sad: number;
  angry: number;
  clap: number;
  fire: number;
}

interface MessageStats {
  allTime: number;
  lastDay: number;
  lastWeek: number;
  lastMonth: number;
  last3Months: number;
  last6Months: number;
  lastYear: number;
}

interface AdminLandingPageProps {}

const AdminLandingPage: React.FC<AdminLandingPageProps> = () => {
  const [users, setUsers] = useState<UserTeam[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTeams: 0,
    totalChannels: 0,
    totalMessages: 0,
    activeUsers: 0,
    totalFiles: 0,
    totalReactions: 0,
  });
  const [reactionStats, setReactionStats] = useState<ReactionStats>({
    total: 0,
    like: 0,
    love: 0,
    laugh: 0,
    wow: 0,
    sad: 0,
    angry: 0,
    clap: 0,
    fire: 0,
  });
  const [messageStats, setMessageStats] = useState<MessageStats>({
    allTime: 0,
    lastDay: 0,
    lastWeek: 0,
    lastMonth: 0,
    last3Months: 0,
    last6Months: 0,
    lastYear: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "messages" | "reactions" | "users" | "teams" | "channels"
  >("dashboard");

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch users and teams
        const [usersResponse, teamsResponse] = await Promise.all([
          api.get<UserTeam[]>("/api/stat/users"),
          api.get<Team[]>("/api/stat/teams"),
        ]);

        console.log("Users Response", usersResponse.data);
        console.log("Teams Response", teamsResponse.data);

        setUsers(usersResponse.data);
        setTeams(teamsResponse.data);

        // Fetch channels for each team
        const allChannels: Channel[] = [];
        const channelPromises = teamsResponse.data.map((team) =>
          api
            .get<Channel[]>(`/api/stat/${team.id}/channels`)
            .then((response) => {
              const teamChannels = response.data;
              allChannels.push(...teamChannels);
              console.log("Team Channels", teamChannels);
              return teamChannels;
            })
        );

        await Promise.all(channelPromises);
        setChannels(allChannels);

        // Fetch basic statistics
        const [
          messagesCountResponse,
          activeUsersResponse,
          filesResponse,
          reactionsResponse,
        ] = await Promise.all([
          api.get<number>("/api/stat/numberOfMessages"),
          api.get<number>("/api/stat/NumberRecentUsers"),
          api.get<number>("/api/stat/files"),
          api.get<number>("/api/stat/reactions"),
        ]);

        setStats({
          totalUsers: usersResponse.data.length,
          totalTeams: teamsResponse.data.length,
          totalChannels: teamsResponse.data.reduce(
            (sum, team) => sum + (team.channelNr || 0),
            0
          ),
          totalMessages: messagesCountResponse.data,
          activeUsers: activeUsersResponse.data,
          totalFiles: filesResponse.data,
          totalReactions: reactionsResponse.data,
        });

        // Fetch message statistics for different time periods
        const [
          allTimeResponse,
          lastDayResponse,
          lastWeekResponse,
          lastMonthResponse,
          last3MonthsResponse,
          last6MonthsResponse,
          lastYearResponse,
        ] = await Promise.all([
          api.get<number>("/api/stat/numberOfMessages"),
          api.post<number>("/api/stat/numberOfMessages/past", "24h"),
          api.post<number>("/api/stat/numberOfMessages/past", "7d"),
          api.post<number>("/api/stat/numberOfMessages/past", "30d"),
          api.post<number>("/api/stat/numberOfMessages/past", "90d"),
          api.post<number>("/api/stat/numberOfMessages/past", "180d"),
          api.post<number>("/api/stat/numberOfMessages/past", "365d"),
        ]);

        setMessageStats({
          allTime: allTimeResponse.data,
          lastDay: lastDayResponse.data,
          lastWeek: lastWeekResponse.data,
          lastMonth: lastMonthResponse.data,
          last3Months: last3MonthsResponse.data,
          last6Months: last6MonthsResponse.data,
          lastYear: lastYearResponse.data,
        });

        // Fetch reaction statistics by type
        const [
          likeResponse,
          loveResponse,
          laughResponse,
          wowResponse,
          sadResponse,
          angryResponse,
          clapResponse,
          fireResponse,
        ] = await Promise.all([
          api.post<number>("/api/stat/reactions", { type: "like" }),
          api.post<number>("/api/stat/reactions", { type: "love" }),
          api.post<number>("/api/stat/reactions", { type: "laugh" }),
          api.post<number>("/api/stat/reactions", { type: "wow" }),
          api.post<number>("/api/stat/reactions", { type: "sad" }),
          api.post<number>("/api/stat/reactions", { type: "angry" }),
          api.post<number>("/api/stat/reactions", { type: "clap" }),
          api.post<number>("/api/stat/reactions", { type: "fire" }),
        ]);

        setReactionStats({
          total: reactionsResponse.data,
          like: likeResponse.data,
          love: loveResponse.data,
          laugh: laughResponse.data,
          wow: wowResponse.data,
          sad: sadResponse.data,
          angry: angryResponse.data,
          clap: clapResponse.data,
          fire: fireResponse.data,
        });
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError("Failed to load admin data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/users/${userId}`);
        setUsers(users.filter((user) => user.id !== userId));
      } catch (err) {
        console.error("Error deleting user:", err);
        setError("Failed to delete user. Please try again.");
      }
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        await api.delete(`/teams/${teamId}`);
        setTeams(teams.filter((team) => team.id !== teamId));
      } catch (err) {
        console.error("Error deleting team:", err);
        setError("Failed to delete team. Please try again.");
      }
    }
  };

  const handleDeleteChannel = async (channelId: string, teamId: string) => {
    if (window.confirm("Are you sure you want to delete this channel?")) {
      try {
        await api.delete(`/${teamId}/channels/${channelId}`);
        setChannels(channels.filter((channel) => channel.id !== channelId));
      } catch (err) {
        console.error("Error deleting channel:", err);
        setError("Failed to delete channel. Please try again.");
      }
    }
  };

  // Chart data for message statistics
  const messageChartData = {
    labels: [
      "Last Day",
      "Last Week",
      "Last Month",
      "3 Months",
      "6 Months",
      "Last Year",
      "All Time",
    ],
    datasets: [
      {
        label: "Number of Messages",
        data: [
          messageStats.lastDay,
          messageStats.lastWeek,
          messageStats.lastMonth,
          messageStats.last3Months,
          messageStats.last6Months,
          messageStats.lastYear,
          messageStats.allTime,
        ],
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(101, 143, 241, 0.6)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(101, 143, 241, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for reaction statistics
  const reactionChartData = {
    labels: [
      "Like 👍",
      "Love ❤️",
      "Laugh 😂",
      "Wow 😮",
      "Sad 😢",
      "Angry 😡",
      "Clap 👏",
      "Fire 🔥",
    ],
    datasets: [
      {
        label: "Number of Reactions",
        data: [
          reactionStats.like,
          reactionStats.love,
          reactionStats.laugh,
          reactionStats.wow,
          reactionStats.sad,
          reactionStats.angry,
          reactionStats.clap,
          reactionStats.fire,
        ],
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(46, 204, 113, 0.6)",
          "rgba(231, 76, 60, 0.6)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(46, 204, 113, 1)",
          "rgba(231, 76, 60, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Message Activity Over Time",
      },
    },
  };

  const reactionChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Reactions by Type",
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-500">
          Monitor and manage your platform's activity and users.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="mb-8">
        <div className="flex overflow-x-auto bg-white rounded-xl shadow-md">
          <button
            className={`py-3 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 ${
              activeTab === "dashboard"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 ${
              activeTab === "messages"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            }`}
            onClick={() => setActiveTab("messages")}
          >
            Messages
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 ${
              activeTab === "reactions"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            }`}
            onClick={() => setActiveTab("reactions")}
          >
            Reactions
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 ${
              activeTab === "users"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            }`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 ${
              activeTab === "teams"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            }`}
            onClick={() => setActiveTab("teams")}
          >
            Teams
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 ${
              activeTab === "channels"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            }`}
            onClick={() => setActiveTab("channels")}
          >
            Channels
          </button>
        </div>
      </div>

      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Users</h3>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalUsers}
              </div>
              <div className="ml-2 text-sm text-gray-500">registered</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Teams</h3>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalTeams}
              </div>
              <div className="ml-2 text-sm text-gray-500">active</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Channels</h3>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalChannels}
              </div>
              <div className="ml-2 text-sm text-gray-500">total</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Messages</h3>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalMessages}
              </div>
              <div className="ml-2 text-sm text-gray-500">exchanged</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-500 text-sm font-medium mb-1">
              Active Users
            </h3>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-indigo-600">
                {stats.activeUsers}
              </div>
              <div className="ml-2 text-sm text-gray-500">recently active</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Files</h3>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-teal-600">
                {stats.totalFiles}
              </div>
              <div className="ml-2 text-sm text-gray-500">uploaded</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-500 text-sm font-medium mb-1">
              Reactions
            </h3>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-orange-600">
                {stats.totalReactions}
              </div>
              <div className="ml-2 text-sm text-gray-500">added</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-500 text-sm font-medium mb-1">
              Activity Rate
            </h3>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-red-600">
                {messageStats.lastWeek > 0
                  ? (messageStats.lastWeek / 7).toFixed(1)
                  : "0"}
              </div>
              <div className="ml-2 text-sm text-gray-500">msgs/day</div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-700 font-medium mb-4">
              User Engagement Distribution
            </h3>
            <div className="h-64">
              <PolarArea
                data={{
                  labels: [
                    "Users",
                    "Teams",
                    "Channels",
                    "Messages",
                    "Files",
                    "Reactions",
                  ],
                  datasets: [
                    {
                      data: [
                        stats.totalUsers,
                        stats.totalTeams,
                        stats.totalChannels,
                        stats.totalMessages > 1000
                          ? stats.totalMessages / 100
                          : stats.totalMessages, // Scale for visualization
                        stats.totalFiles,
                        stats.totalReactions,
                      ],
                      backgroundColor: [
                        "rgba(54, 162, 235, 0.7)",
                        "rgba(75, 192, 192, 0.7)",
                        "rgba(153, 102, 255, 0.7)",
                        "rgba(255, 99, 132, 0.7)",
                        "rgba(255, 159, 64, 0.7)",
                        "rgba(255, 206, 86, 0.7)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "right",
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-700 font-medium mb-4">
              Reaction Distribution
            </h3>
            <div className="h-64">
              <Doughnut
                data={{
                  labels: [
                    "Like 👍",
                    "Love ❤️",
                    "Laugh 😂",
                    "Wow 😮",
                    "Sad 😢",
                    "Angry 😡",
                    "Clap 👏",
                    "Fire 🔥",
                  ],
                  datasets: [
                    {
                      data: [
                        reactionStats.like,
                        reactionStats.love,
                        reactionStats.laugh,
                        reactionStats.wow,
                        reactionStats.sad,
                        reactionStats.angry,
                        reactionStats.clap,
                        reactionStats.fire,
                      ],
                      backgroundColor: [
                        "rgba(54, 162, 235, 0.7)",
                        "rgba(255, 99, 132, 0.7)",
                        "rgba(255, 206, 86, 0.7)",
                        "rgba(153, 102, 255, 0.7)",
                        "rgba(75, 192, 192, 0.7)",
                        "rgba(255, 159, 64, 0.7)",
                        "rgba(46, 204, 113, 0.7)",
                        "rgba(231, 76, 60, 0.7)",
                      ],
                      borderColor: [
                        "rgba(54, 162, 235, 1)",
                        "rgba(255, 99, 132, 1)",
                        "rgba(255, 206, 86, 1)",
                        "rgba(153, 102, 255, 1)",
                        "rgba(75, 192, 192, 1)",
                        "rgba(255, 159, 64, 1)",
                        "rgba(46, 204, 113, 1)",
                        "rgba(231, 76, 60, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "right",
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-700 font-medium mb-4">
              Message Activity Timeline
            </h3>
            <div className="h-80">
              <Line
                data={{
                  labels: [
                    "Last Day",
                    "Last Week",
                    "Last Month",
                    "3 Months",
                    "6 Months",
                    "Last Year",
                  ],
                  datasets: [
                    {
                      label: "Message Volume",
                      data: [
                        messageStats.lastDay,
                        messageStats.lastWeek,
                        messageStats.lastMonth,
                        messageStats.last3Months,
                        messageStats.last6Months,
                        messageStats.lastYear,
                      ],
                      fill: true,
                      backgroundColor: "rgba(75, 192, 192, 0.2)",
                      borderColor: "rgba(75, 192, 192, 1)",
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    title: {
                      display: true,
                      text: "Message Volume Over Time",
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "messages" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-800 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-600 font-medium mb-3">All Time</h3>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-gray-900">
                {messageStats.allTime}
              </div>
              <div className="ml-2 text-sm text-gray-500">messages</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-600 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-600 font-medium mb-3">Last 24 Hours</h3>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-indigo-600">
                {messageStats.lastDay}
              </div>
              <div className="ml-2 text-sm text-gray-500">messages</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {messageStats.allTime > 0 ? (
                <span>
                  {(
                    (messageStats.lastDay / messageStats.allTime) *
                    100
                  ).toFixed(1)}
                  % of all messages
                </span>
              ) : (
                <span>0% of all messages</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-600 font-medium mb-3">Last Week</h3>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-blue-600">
                {messageStats.lastWeek}
              </div>
              <div className="ml-2 text-sm text-gray-500">messages</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {messageStats.allTime > 0 ? (
                <span>
                  {(
                    (messageStats.lastWeek / messageStats.allTime) *
                    100
                  ).toFixed(1)}
                  % of all messages
                </span>
              ) : (
                <span>0% of all messages</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-600 font-medium mb-3">Last Month</h3>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-green-600">
                {messageStats.lastMonth}
              </div>
              <div className="ml-2 text-sm text-gray-500">messages</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {messageStats.allTime > 0 ? (
                <span>
                  {(
                    (messageStats.lastMonth / messageStats.allTime) *
                    100
                  ).toFixed(1)}
                  % of all messages
                </span>
              ) : (
                <span>0% of all messages</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-600 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-600 font-medium mb-3">Last 3 Months</h3>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-purple-600">
                {messageStats.last3Months}
              </div>
              <div className="ml-2 text-sm text-gray-500">messages</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {messageStats.allTime > 0 ? (
                <span>
                  {(
                    (messageStats.last3Months / messageStats.allTime) *
                    100
                  ).toFixed(1)}
                  % of all messages
                </span>
              ) : (
                <span>0% of all messages</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-600 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-600 font-medium mb-3">Last 6 Months</h3>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-yellow-600">
                {messageStats.last6Months}
              </div>
              <div className="ml-2 text-sm text-gray-500">messages</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {messageStats.allTime > 0 ? (
                <span>
                  {(
                    (messageStats.last6Months / messageStats.allTime) *
                    100
                  ).toFixed(1)}
                  % of all messages
                </span>
              ) : (
                <span>0% of all messages</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-600 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-600 font-medium mb-3">Last Year</h3>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-red-600">
                {messageStats.lastYear}
              </div>
              <div className="ml-2 text-sm text-gray-500">messages</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {messageStats.allTime > 0 ? (
                <span>
                  {(
                    (messageStats.lastYear / messageStats.allTime) *
                    100
                  ).toFixed(1)}
                  % of all messages
                </span>
              ) : (
                <span>0% of all messages</span>
              )}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-700 font-medium mb-4">
              Message Activity Growth
            </h3>
            <div className="h-80">
              <Line
                data={{
                  labels: [
                    "Last Day",
                    "Last Week",
                    "Last Month",
                    "3 Months",
                    "6 Months",
                    "Last Year",
                    "All Time",
                  ],
                  datasets: [
                    {
                      label: "Message Volume",
                      data: [
                        messageStats.lastDay,
                        messageStats.lastWeek,
                        messageStats.lastMonth,
                        messageStats.last3Months,
                        messageStats.last6Months,
                        messageStats.lastYear,
                        messageStats.allTime,
                      ],
                      fill: true,
                      backgroundColor: "rgba(54, 162, 235, 0.2)",
                      borderColor: "rgba(54, 162, 235, 1)",
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="col-span-1 md:col-span-3 lg:col-span-3 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-700 font-medium mb-4">
              Comparative Message Activity
            </h3>
            <div className="h-80">
              <Bar
                data={{
                  labels: [
                    "Last Day",
                    "Last Week",
                    "Last Month",
                    "3 Months",
                    "6 Months",
                    "Last Year",
                    "All Time",
                  ],
                  datasets: [
                    {
                      label: "Message Volume",
                      data: [
                        messageStats.lastDay,
                        messageStats.lastWeek,
                        messageStats.lastMonth,
                        messageStats.last3Months,
                        messageStats.last6Months,
                        messageStats.lastYear,
                        messageStats.allTime,
                      ],
                      backgroundColor: [
                        "rgba(54, 162, 235, 0.6)",
                        "rgba(75, 192, 192, 0.6)",
                        "rgba(153, 102, 255, 0.6)",
                        "rgba(255, 159, 64, 0.6)",
                        "rgba(255, 99, 132, 0.6)",
                        "rgba(255, 206, 86, 0.6)",
                        "rgba(101, 143, 241, 0.6)",
                      ],
                      borderColor: [
                        "rgba(54, 162, 235, 1)",
                        "rgba(75, 192, 192, 1)",
                        "rgba(153, 102, 255, 1)",
                        "rgba(255, 159, 64, 1)",
                        "rgba(255, 99, 132, 1)",
                        "rgba(255, 206, 86, 1)",
                        "rgba(101, 143, 241, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    title: {
                      display: true,
                      text: "Messages by Time Period",
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "reactions" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-500 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-600 font-medium mb-3">Total Reactions</h3>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-gray-900">
                {reactionStats.total}
              </div>
              <div className="ml-2 text-sm text-gray-500">all time</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-600 font-medium mb-3">
              Like Reactions 👍
            </h3>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-blue-600">
                {reactionStats.like}
              </div>
              <div className="ml-2 text-sm text-gray-500">
                {reactionStats.total > 0
                  ? `(${(
                      (reactionStats.like / reactionStats.total) *
                      100
                    ).toFixed(1)}%)`
                  : "(0%)"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-600 font-medium mb-3">
              Love Reactions ❤️
            </h3>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-red-600">
                {reactionStats.love}
              </div>
              <div className="ml-2 text-sm text-gray-500">
                {reactionStats.total > 0
                  ? `(${(
                      (reactionStats.love / reactionStats.total) *
                      100
                    ).toFixed(1)}%)`
                  : "(0%)"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-600 font-medium mb-3">
              Laugh Reactions 😂
            </h3>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-yellow-600">
                {reactionStats.laugh}
              </div>
              <div className="ml-2 text-sm text-gray-500">
                {reactionStats.total > 0
                  ? `(${(
                      (reactionStats.laugh / reactionStats.total) *
                      100
                    ).toFixed(1)}%)`
                  : "(0%)"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-600 font-medium mb-3">Wow Reactions 😮</h3>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-purple-600">
                {reactionStats.wow}
              </div>
              <div className="ml-2 text-sm text-gray-500">
                {reactionStats.total > 0
                  ? `(${(
                      (reactionStats.wow / reactionStats.total) *
                      100
                    ).toFixed(1)}%)`
                  : "(0%)"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-300 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-600 font-medium mb-3">Sad Reactions 😢</h3>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-blue-400">
                {reactionStats.sad}
              </div>
              <div className="ml-2 text-sm text-gray-500">
                {reactionStats.total > 0
                  ? `(${(
                      (reactionStats.sad / reactionStats.total) *
                      100
                    ).toFixed(1)}%)`
                  : "(0%)"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-700 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-600 font-medium mb-3">
              Angry Reactions 😡
            </h3>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-red-700">
                {reactionStats.angry}
              </div>
              <div className="ml-2 text-sm text-gray-500">
                {reactionStats.total > 0
                  ? `(${(
                      (reactionStats.angry / reactionStats.total) *
                      100
                    ).toFixed(1)}%)`
                  : "(0%)"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-600 font-medium mb-3">
              Clap Reactions 👏
            </h3>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-green-600">
                {reactionStats.clap}
              </div>
              <div className="ml-2 text-sm text-gray-500">
                {reactionStats.total > 0
                  ? `(${(
                      (reactionStats.clap / reactionStats.total) *
                      100
                    ).toFixed(1)}%)`
                  : "(0%)"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-600 font-medium mb-3">
              Fire Reactions 🔥
            </h3>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-orange-600">
                {reactionStats.fire}
              </div>
              <div className="ml-2 text-sm text-gray-500">
                {reactionStats.total > 0
                  ? `(${(
                      (reactionStats.fire / reactionStats.total) *
                      100
                    ).toFixed(1)}%)`
                  : "(0%)"}
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-700 font-medium mb-4">
              Reaction Distribution
            </h3>
            <div className="h-80">
              <Doughnut
                data={{
                  labels: [
                    "Like 👍",
                    "Love ❤️",
                    "Laugh 😂",
                    "Wow 😮",
                    "Sad 😢",
                    "Angry 😡",
                    "Clap 👏",
                    "Fire 🔥",
                  ],
                  datasets: [
                    {
                      data: [
                        reactionStats.like,
                        reactionStats.love,
                        reactionStats.laugh,
                        reactionStats.wow,
                        reactionStats.sad,
                        reactionStats.angry,
                        reactionStats.clap,
                        reactionStats.fire,
                      ],
                      backgroundColor: [
                        "rgba(54, 162, 235, 0.7)",
                        "rgba(255, 99, 132, 0.7)",
                        "rgba(255, 206, 86, 0.7)",
                        "rgba(153, 102, 255, 0.7)",
                        "rgba(75, 192, 192, 0.7)",
                        "rgba(255, 159, 64, 0.7)",
                        "rgba(46, 204, 113, 0.7)",
                        "rgba(231, 76, 60, 0.7)",
                      ],
                      borderColor: [
                        "rgba(54, 162, 235, 1)",
                        "rgba(255, 99, 132, 1)",
                        "rgba(255, 206, 86, 1)",
                        "rgba(153, 102, 255, 1)",
                        "rgba(75, 192, 192, 1)",
                        "rgba(255, 159, 64, 1)",
                        "rgba(46, 204, 113, 1)",
                        "rgba(231, 76, 60, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "right",
                    },
                    title: {
                      display: true,
                      text: "Reaction Types",
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-700 font-medium mb-4">
              Reaction Comparison
            </h3>
            <div className="h-80">
              <PolarArea
                data={{
                  labels: [
                    "Like 👍",
                    "Love ❤️",
                    "Laugh 😂",
                    "Wow 😮",
                    "Sad 😢",
                    "Angry 😡",
                    "Clap 👏",
                    "Fire 🔥",
                  ],
                  datasets: [
                    {
                      data: [
                        reactionStats.like,
                        reactionStats.love,
                        reactionStats.laugh,
                        reactionStats.wow,
                        reactionStats.sad,
                        reactionStats.angry,
                        reactionStats.clap,
                        reactionStats.fire,
                      ],
                      backgroundColor: [
                        "rgba(54, 162, 235, 0.7)",
                        "rgba(255, 99, 132, 0.7)",
                        "rgba(255, 206, 86, 0.7)",
                        "rgba(153, 102, 255, 0.7)",
                        "rgba(75, 192, 192, 0.7)",
                        "rgba(255, 159, 64, 0.7)",
                        "rgba(46, 204, 113, 0.7)",
                        "rgba(231, 76, 60, 0.7)",
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-700 font-medium mb-4">
              Reaction Activity Overview
            </h3>
            <div className="h-80">
              <Bar
                data={{
                  labels: [
                    "Like 👍",
                    "Love ❤️",
                    "Laugh 😂",
                    "Wow 😮",
                    "Sad 😢",
                    "Angry 😡",
                    "Clap 👏",
                    "Fire 🔥",
                  ],
                  datasets: [
                    {
                      label: "Number of Reactions",
                      data: [
                        reactionStats.like,
                        reactionStats.love,
                        reactionStats.laugh,
                        reactionStats.wow,
                        reactionStats.sad,
                        reactionStats.angry,
                        reactionStats.clap,
                        reactionStats.fire,
                      ],
                      backgroundColor: [
                        "rgba(54, 162, 235, 0.6)",
                        "rgba(255, 99, 132, 0.6)",
                        "rgba(255, 206, 86, 0.6)",
                        "rgba(153, 102, 255, 0.6)",
                        "rgba(75, 192, 192, 0.6)",
                        "rgba(255, 159, 64, 0.6)",
                        "rgba(46, 204, 113, 0.6)",
                        "rgba(231, 76, 60, 0.6)",
                      ],
                      borderColor: [
                        "rgba(54, 162, 235, 1)",
                        "rgba(255, 99, 132, 1)",
                        "rgba(255, 206, 86, 1)",
                        "rgba(153, 102, 255, 1)",
                        "rgba(75, 192, 192, 1)",
                        "rgba(255, 159, 64, 1)",
                        "rgba(46, 204, 113, 1)",
                        "rgba(231, 76, 60, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    title: {
                      display: true,
                      text: "Reaction Distribution",
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            <span className="text-gray-500">{`${user.firstName.charAt(
                              0
                            )}${user.lastName.charAt(0)}`}</span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {`${user.firstName} ${user.lastName}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {user.roles.map((role, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 mr-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === "online"
                            ? "bg-green-100 text-green-800"
                            : user.status === "busy"
                            ? "bg-red-100 text-red-800"
                            : user.status === "away"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.status || "offline"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm transition-colors duration-150"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "teams" && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Messages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channels
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teams.map((team) => (
                  <tr
                    key={team.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {team.iconUrl || team.icon ? (
                            <img
                              src={team.iconUrl || team.icon}
                              alt={team.name}
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            <span className="text-gray-500">
                              {team.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {team.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Created:{" "}
                            {new Date(team.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {team.description || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">
                        {team.messageNr || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        {team.reactionNr
                          ? `${team.reactionNr} reactions`
                          : "No reactions"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          {team.channelNr || 0} channels
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm transition-colors duration-150"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "channels" && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Privacy
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {channels.map((channel) => {
                  const parentTeam = teams.find(
                    (team) => team.id === channel.teamId
                  );
                  return (
                    <tr
                      key={channel.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{channel.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {parentTeam &&
                          (parentTeam.iconUrl || parentTeam.icon) ? (
                            <img
                              src={parentTeam.iconUrl || parentTeam.icon}
                              alt={parentTeam?.name}
                              className="h-5 w-5 mr-2 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                              <span className="text-xs text-gray-500">
                                {parentTeam ? parentTeam.name.charAt(0) : "?"}
                              </span>
                            </div>
                          )}
                          <div className="text-sm text-gray-900">
                            {parentTeam ? parentTeam.name : "Unknown Team"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {channel.description || "No description"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            channel.isPrivate
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {channel.isPrivate ? "Private" : "Public"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            handleDeleteChannel(channel.id, channel.teamId)
                          }
                          className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm transition-colors duration-150"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLandingPage;
