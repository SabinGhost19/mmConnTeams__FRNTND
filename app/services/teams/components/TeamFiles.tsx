// components/TeamsLanding/TeamFiles.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import { getFullName, getAvatarUrl } from "@/app/lib/userUtils";
import FileUploadModal from "./FileUploadModal";
import File from "@/app/types/models_types/file";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/contexts/auth-context";

interface TeamFilesProps {
  teamId: string;
  channels: any[];
  members: any[];
}

const TeamFiles: React.FC<TeamFilesProps> = ({
  teamId,
  channels = [],
  members = [],
}) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [filterChannel, setFilterChannel] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(
    null
  );
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    try {
      setIsLoadingFiles(true);
      setError(null);
      const response = await api.get(`/api/files/all/${teamId}`);
      const filesData = response.data.map((file: any) => ({
        id: file.id,
        teamId: file.teamId,
        channelId: file.channelId,
        name: file.fileName,
        type: file.fileType,
        size: file.fileSize?.toString() || "0",
        uploadedBy: file.uploadedById,
        uploadedAt: file.uploadedAt,
        url: file.url,
      }));
      setFiles(filesData);
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Failed to load files. Please try again later.");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [teamId]);

  const handleUpload = async (
    file: globalThis.File,
    channelId: string,
    fileName: string
  ) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("team_id", teamId);
      formData.append("channel_id", channelId);
      formData.append("file_name", fileName);

      const response = await api.post("/api/files/upload/explicit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newFile: File = {
        id: response.data.id.toString(),
        teamId: teamId,
        channelId: channelId,
        name: fileName,
        type: file.type,
        size: file.size.toString(),
        uploadedBy: user?.id || 0,
        uploadedAt: new Date().toISOString(),
        url: response.data.url,
      };

      setFiles((prevFiles) => [...prevFiles, newFile]);
      setShowUploadModal(false);
      setSelectedFile(null);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await api.delete(`/api/files/${fileId}`);
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file. Please try again.");
    }
  };

  // Filtrare după textul căutat
  const filteredFiles = files.filter((file) => {
    const nameMatch =
      file?.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ?? false;
    const channelMatch =
      filterChannel === "all" || file?.channelId?.toString() === filterChannel;
    const typeMatch = filterType === "all" || file?.type === filterType;

    return nameMatch && channelMatch && typeMatch;
  });

  // Sortare fișiere
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === "name") {
      return (a?.name || "").localeCompare(b?.name || "");
    } else if (sortBy === "type") {
      return (a?.type || "").localeCompare(b?.type || "");
    } else if (sortBy === "channel") {
      const channelA = channels.find((c) => c.id === a?.channelId)?.name || "";
      const channelB = channels.find((c) => c.id === b?.channelId)?.name || "";
      return channelA.localeCompare(channelB);
    } else {
      // Data (descendent)
      const dateA = new Date(a?.uploadedAt || 0).getTime();
      const dateB = new Date(b?.uploadedAt || 0).getTime();
      return dateB - dateA;
    }
  });

  // Extrage tipurile unice de fișiere pentru filtrare
  const fileTypes = Array.from(
    new Set(files.map((file) => file?.type).filter(Boolean))
  );

  // Obține icoana pentru fiecare tip de fișier
  const getFileIcon = (type: any) => {
    switch (type) {
      case "pdf":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        );
      case "image":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case "word":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-blue-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case "excel":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case "powerpoint":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-orange-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
          </svg>
        );
      case "markdown":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
            />
          </svg>
        );
    }
  };

  // Formatare dată
  const formatUploadDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowUploadModal(true);
    }
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-bold text-gray-800">Fișiere</h2>

        <div className="flex items-center space-x-2">
          {Array.isArray(channels) && channels.length > 0 && (
            <select
              value={selectedChannel || ""}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="border rounded-lg text-sm px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoadingFiles}
            >
              <option value="">Selectează canal</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={triggerFileUpload}
            disabled={uploading || isLoadingFiles}
            className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center text-sm ${
              uploading || isLoadingFiles ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {uploading ? (
              <span>Se încarcă...</span>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"
                  />
                </svg>
                Încarcă fișier
              </>
            )}
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Search & Filters */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Caută fișiere..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoadingFiles}
            />
          </div>

          <div className="flex space-x-3">
            <div>
              <select
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value)}
                className="border rounded-lg text-sm px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoadingFiles}
              >
                <option value="all">Toate canalele</option>
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border rounded-lg text-sm px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoadingFiles}
              >
                <option value="all">Toate tipurile</option>
                {fileTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg text-sm px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoadingFiles}
              >
                <option value="date">Sortează după dată</option>
                <option value="name">Sortează după nume</option>
                <option value="type">Sortează după tip</option>
                <option value="channel">Sortează după canal</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Files List */}
      {isLoadingFiles ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <p className="text-gray-600 mb-1">Se încarcă fișierele...</p>
          <p className="text-gray-500 text-sm">Vă rugăm să așteptați.</p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reîncarcă
          </button>
        </div>
      ) : sortedFiles.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fișier
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Canal
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Încărcat de
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Data
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Mărime
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acțiuni</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedFiles.map((file) => {
                const channel = channels.find((c) => c.id === file.channelId);
                const uploader = members.find((m) => m.id === file.uploadedBy);

                return (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {file.type.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        #{channel?.name || "Canal necunoscut"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <img
                            className="h-8 w-8 rounded-full"
                            src={getAvatarUrl(uploader)}
                            alt=""
                          />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {getFullName(uploader)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatUploadDate(file.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a
                        href={file.url}
                        download
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        <span className="sr-only">Descarcă</span>
                      </a>
                      <button className="text-gray-600 hover:text-gray-900">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                          />
                        </svg>
                        <span className="sr-only">Mai multe opțiuni</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">Niciun fișier găsit</p>
          <p className="text-gray-500 text-sm mb-4">
            {searchQuery || filterChannel !== "all" || filterType !== "all"
              ? "Încearcă să schimbi filtrele sau caută alt termen."
              : "Încarcă primul fișier pentru această echipă."}
          </p>
          <button
            onClick={triggerFileUpload}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"
              />
            </svg>
            Încarcă fișier
          </button>
        </div>
      )}

      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedFile(null);
        }}
        onUpload={handleUpload}
        channels={channels || []}
        selectedFile={selectedFile}
      />
    </div>
  );
};

export default TeamFiles;
