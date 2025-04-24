// components/TeamsLanding/TeamFiles.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import { getFullName, getAvatarUrl } from "@/app/lib/userUtils";
import FileUploadModal from "./FileUploadModal";
import File from "@/app/types/models_types/file";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/contexts/auth-context";
import { motion } from "framer-motion";
import {
  FiFile,
  FiDownload,
  FiShare2,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiImage,
  FiFileText,
  FiCode,
  FiMusic,
  FiVideo,
  FiArchive,
  FiDatabase,
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
import Channel from "@/app/types/models_types/channel";
import { UserTeam } from "@/app/types/models_types/userType";

// Interface for backend file response
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

interface TeamFilesProps {
  teamId: string;
  files: BackendFile[];
  channels: Channel[];
  members: UserTeam[];
  onFileUpload?: (
    file: Blob,
    teamId: string,
    channelId: string,
    fileName: string
  ) => Promise<any>;
  isLoading?: boolean;
  onUploadFile?: (
    file: BackendFile,
    channelId: string,
    fileName: string
  ) => void;
  onDeleteFile?: (fileId: string) => void;
  onDownloadFile?: (
    fileId: string,
    awsS3Key?: string,
    fileName?: string
  ) => void;
  onShareFile?: (fileId: string, userIds: string[]) => void;
}

const TeamFiles: React.FC<TeamFilesProps> = ({
  teamId,
  files,
  channels,
  members,
  onFileUpload,
  isLoading,
  onUploadFile,
  onDeleteFile,
  onDownloadFile,
  onShareFile,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to convert file size to bytes
  const getFileSizeInBytes = (size: number): number => {
    return size;
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const filteredFiles = files
    .filter((file) => {
      const matchesSearch = (file.fileName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesChannel =
        selectedChannel === "all" || file.channelId === selectedChannel;
      return matchesSearch && matchesChannel;
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
          return (
            getFileSizeInBytes(b.fileSize) - getFileSizeInBytes(a.fileSize)
          );
        default:
          return 0;
      }
    });

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

    // Font files
    if (
      fileType.includes("font") ||
      ["ttf", "otf", "woff", "woff2"].includes(extension)
    ) {
      return <BsFileEarmarkFont className="h-5 w-5 text-indigo-500" />;
    }

    // Database files
    if (
      fileType.includes("database") ||
      ["sql", "db", "sqlite"].includes(extension)
    ) {
      return <FiDatabase className="h-5 w-5 text-teal-500" />;
    }

    // Binary files
    if (
      fileType.includes("binary") ||
      ["exe", "dll", "bin", "dat"].includes(extension)
    ) {
      return <BsFileEarmarkBinary className="h-5 w-5 text-gray-600" />;
    }

    // Default file icon
    return <FiFile className="h-5 w-5 text-gray-400" />;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowUploadModal(true);
    }
  };

  const handleFileUpload = async (
    file: Blob,
    teamId: string,
    channelId: string,
    fileName: string
  ) => {
    if (onFileUpload) {
      try {
        const response = await onFileUpload(file, teamId, channelId, fileName);
        setShowUploadModal(false);
        setSelectedFile(null);
        return response;
      } catch (error) {
        setError("Failed to upload file. Please try again.");
        console.error("Error uploading file:", error);
        throw error;
      }
    }
  };

  const handleDownload = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (file && file.awsS3Key) {
      onDownloadFile?.(fileId, file.awsS3Key, file.fileName);
    } else {
      console.error("File or awsS3Key not found");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Channels</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "name" | "date" | "size")
            }
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>
        </div>
      </div>

      {/* Files Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                File Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Channel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uploaded By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Loading files...
                </td>
              </tr>
            ) : filteredFiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No files found
                </td>
              </tr>
            ) : (
              filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getFileIcon(file.fileType, file.fileName)}
                      <span className="text-sm font-medium text-gray-900 ml-2">
                        {file.fileName || "Unnamed File"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {channels.find((c) => c.id === file.channelId)?.name ||
                        "Unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {members.find((m) => m.id === file.uploadedById)
                        ? getFullName(
                            members.find((m) => m.id === file.uploadedById)!
                          )
                        : "Unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {formatFileSize(file.fileSize)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleDownload(file.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Download"
                      >
                        <FiDownload className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onShareFile?.(file.id, [])}
                        className="text-green-600 hover:text-green-900"
                      >
                        <FiShare2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteFile?.(file.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedFile(null);
        }}
        onUpload={handleFileUpload}
        channels={channels}
        selectedFile={selectedFile}
        teamId={teamId}
      />
    </div>
  );
};

export default TeamFiles;
