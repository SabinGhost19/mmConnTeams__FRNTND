"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/app/lib/api";
import ProtectedRoute from "../components/ProtectedRoutes";
import RoleExclusionGuard from "../components/RoleExclusionGuard";
import { ROLE } from "../types/models_types/roles";
import Channel from "@/app/types/models_types/channel";
import { UserTeam } from "../types/models_types/userType";
import {
  FiFile,
  FiDownload,
  FiShare2,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiPlus,
  FiChevronDown,
  FiImage,
  FiFileText,
  FiCode,
  FiMusic,
  FiVideo,
  FiArchive,
} from "react-icons/fi";
import {
  BsFileEarmarkPdf,
  BsFileEarmarkWord,
  BsFileEarmarkExcel,
  BsFileEarmarkPpt,
  BsFileEarmarkZip,
  BsFileEarmarkFont,
  BsFileEarmarkBinary,
} from "react-icons/bs";

// Interface pentru Team
interface Team {
  id: string;
  name: string;
  description: string;
  icon?: string;
  channels: Channel[];
  members: string[];
  createdBy: string;
  createdAt: string;
}

// Interface pentru fișierele din backend
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
  awsS3Key?: string;
}

const FilesPage = () => {
  const router = useRouter();
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [allFiles, setAllFiles] = useState<BackendFile[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [members, setMembers] = useState<UserTeam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Încărcarea datelor la pornirea paginii
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Obținem toate echipele utilizatorului
        const teamsResponse = await api.get("/api/user-teams");
        const teams = teamsResponse.data || [];
        setUserTeams(teams);

        // Pentru fiecare echipă, încărcăm fișierele
        const allFilesArray: BackendFile[] = [];
        const allChannelsArray: Channel[] = [];

        // Obținem fișierele pentru fiecare echipă
        await Promise.all(
          teams.map(async (team: Team) => {
            try {
              const filesResponse = await api.get(`/api/files/all/${team.id}`);
              const teamFiles = filesResponse.data || [];
              allFilesArray.push(...teamFiles);

              // Adăugăm canalele echipei în lista noastră
              if (team.channels) {
                allChannelsArray.push(...team.channels);
              }
            } catch (err) {
              console.error(`Error fetching files for team ${team.id}:`, err);
            }
          })
        );

        setAllFiles(allFilesArray);
        setChannels(allChannelsArray);

        // Obținem lista completă de utilizatori
        const usersResponse = await api.get("/api/users");
        setMembers(usersResponse.data || []);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(
          err.response?.status === 500
            ? "Server error: The service is currently unavailable"
            : err instanceof Error
            ? err.message
            : "An error occurred fetching data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Filtrarea fișierelor în funcție de căutare și echipa selectată
  const filteredFiles = allFiles
    .filter((file) => {
      const matchesSearch = (file.fileName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesTeam =
        selectedTeam === "all" || file.teamId === selectedTeam;
      return matchesSearch && matchesTeam;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.fileName || "").localeCompare(b.fileName || "");
        case "date":
          return (
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          );
        case "size":
          return b.fileSize - a.fileSize;
        default:
          return 0;
      }
    });

  // Funcție pentru a obține numele echipei după ID
  const getTeamName = (teamId: string): string => {
    const team = userTeams.find((team) => team.id === teamId);
    return team ? team.name : "Unknown Team";
  };

  // Funcție pentru a obține numele canalului după ID
  const getChannelName = (channelId: string): string => {
    const channel = channels.find((channel) => channel.id === channelId);
    return channel ? channel.name : "General";
  };

  // Funcție pentru a obține numele utilizatorului după ID
  const getUserName = (userId: string): string => {
    const user = members.find((member) => member.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  };

  // Funcție pentru a descărca un fișier
  const handleDownloadFile = async (
    fileId: string,
    awsS3Key?: string,
    fileName?: string
  ) => {
    try {
      const response = await api.get(`/api/files/download/${awsS3Key}`, {
        params: {
          awsS3Key,
          fileName,
        },
        responseType: "blob",
      });

      const file = allFiles.find((f) => f.id === fileId);
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

  // Get file icon based on file type and extension
  const getFileIcon = (fileType: string, fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";

    // Image files
    if (
      fileType.includes("image") ||
      ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(extension)
    ) {
      return <FiImage className="h-5 w-5 text-blue-500" />;
    }

    // PDF files
    if (fileType.includes("pdf") || extension === "pdf") {
      return <BsFileEarmarkPdf className="h-5 w-5 text-red-500" />;
    }

    // Word documents
    if (
      fileType.includes("word") ||
      fileType.includes("document") ||
      ["doc", "docx"].includes(extension)
    ) {
      return <BsFileEarmarkWord className="h-5 w-5 text-blue-600" />;
    }

    // Excel files
    if (
      fileType.includes("excel") ||
      fileType.includes("spreadsheet") ||
      ["xls", "xlsx", "csv"].includes(extension)
    ) {
      return <BsFileEarmarkExcel className="h-5 w-5 text-green-500" />;
    }

    // PowerPoint files
    if (
      fileType.includes("presentation") ||
      fileType.includes("powerpoint") ||
      ["ppt", "pptx"].includes(extension)
    ) {
      return <BsFileEarmarkPpt className="h-5 w-5 text-orange-500" />;
    }

    // Text files
    if (
      fileType.includes("text") ||
      ["txt", "rtf", "md", "log"].includes(extension)
    ) {
      return <FiFileText className="h-5 w-5 text-gray-500" />;
    }

    // Code files
    if (
      fileType.includes("code") ||
      [
        "js",
        "jsx",
        "ts",
        "tsx",
        "html",
        "css",
        "json",
        "py",
        "java",
        "cpp",
        "c",
        "php",
      ].includes(extension)
    ) {
      return <FiCode className="h-5 w-5 text-purple-500" />;
    }

    // Audio files
    if (
      fileType.includes("audio") ||
      ["mp3", "wav", "ogg", "m4a", "wma"].includes(extension)
    ) {
      return <FiMusic className="h-5 w-5 text-pink-500" />;
    }

    // Video files
    if (
      fileType.includes("video") ||
      ["mp4", "avi", "mov", "wmv", "flv", "mkv"].includes(extension)
    ) {
      return <FiVideo className="h-5 w-5 text-red-600" />;
    }

    // Archive files
    if (
      fileType.includes("archive") ||
      fileType.includes("compressed") ||
      ["zip", "rar", "7z", "tar", "gz"].includes(extension)
    ) {
      return <BsFileEarmarkZip className="h-5 w-5 text-yellow-500" />;
    }

    // Default file icon
    return <FiFile className="h-5 w-5 text-blue-500" />;
  };

  return (
    <ProtectedRoute>
      <RoleExclusionGuard
        excludedRoles={[ROLE.ADMIN]}
        redirectTo="/admin"
        allowIfHasRole={[ROLE.STUDENT]}
      >
        <div className="relative min-h-screen">
          {/* Blurred background image */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
              alt="Files Background"
              fill
              style={{ objectFit: "cover" }}
              quality={80}
              className="opacity-10"
            />
          </div>

          <div className="container relative z-10 mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Toate Fișierele
              </h1>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-md transition-colors flex items-center shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Înapoi la Dashboard
              </button>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-gray-200">
              {/* Header and Search */}
              <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Fișierele Mele
                    </h2>
                    <span className="ml-2 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md shadow-sm">
                      {allFiles.length} fișiere
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {/* Search Bar */}
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Caută fișiere..."
                        className="px-4 py-2 pl-10 pr-4 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                      />
                      <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                    </div>

                    {/* Team Filter */}
                    <div className="relative">
                      <select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="appearance-none px-4 py-2 pl-10 pr-10 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full"
                      >
                        <option value="all">Toate echipele</option>
                        {userTeams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                      <FiFilter className="absolute left-3 top-2.5 text-gray-400" />
                      <FiChevronDown className="absolute right-3 top-2.5 text-gray-400" />
                    </div>

                    {/* Sort Options */}
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) =>
                          setSortBy(e.target.value as "name" | "date" | "size")
                        }
                        className="appearance-none px-4 py-2 pr-10 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full"
                      >
                        <option value="date">Cele mai recente</option>
                        <option value="name">Nume (A-Z)</option>
                        <option value="size">Mărime</option>
                      </select>
                      <FiChevronDown className="absolute right-3 top-2.5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Files List */}
              <div className="p-4 sm:p-6">
                {loading ? (
                  <div className="text-center py-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Se încarcă fișierele...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-24">
                    <div className="bg-red-100 text-red-500 p-4 rounded-lg mb-4">
                      <p>{error}</p>
                    </div>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Reîncearcă
                    </button>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="text-center py-24">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FiFile className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Nu s-au găsit fișiere
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery
                        ? "Încercați să modificați criteriile de căutare"
                        : "Nu aveți niciun fișier încărcat în echipele dvs."}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop View */}
                    <div className="hidden md:block">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nume
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Echipă
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Canal
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Încărcat de
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Data
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mărime
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acțiuni
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredFiles.map((file) => (
                            <tr
                              key={file.id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                    {getFileIcon(file.fileType, file.fileName)}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                      {file.fileName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {file.fileType.split("/")[1] ||
                                        file.fileType}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {getTeamName(file.teamId)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {getChannelName(file.channelId)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {getUserName(file.uploadedById)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {new Date(
                                    file.uploadedAt
                                  ).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {formatFileSize(file.fileSize)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() =>
                                      handleDownloadFile(
                                        file.id,
                                        file.awsS3Key,
                                        file.fileName
                                      )
                                    }
                                    className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                                    title="Descarcă"
                                  >
                                    <FiDownload className="h-5 w-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View */}
                    <div className="block md:hidden space-y-3">
                      {filteredFiles.map((file) => (
                        <div
                          key={file.id}
                          className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                {getFileIcon(file.fileType, file.fileName)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 truncate max-w-[180px]">
                                  {file.fileName}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {formatFileSize(file.fileSize)} •{" "}
                                  {new Date(
                                    file.uploadedAt
                                  ).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {getTeamName(file.teamId)} /{" "}
                                  {getChannelName(file.channelId)}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  handleDownloadFile(
                                    file.id,
                                    file.awsS3Key,
                                    file.fileName
                                  )
                                }
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                              >
                                <FiDownload className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </RoleExclusionGuard>
    </ProtectedRoute>
  );
};

export default FilesPage;
