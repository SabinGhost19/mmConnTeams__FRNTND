import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Channel from "@/app/types/models_types/channel";
import { FiUpload } from "react-icons/fi";

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

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (
    file: Blob,
    teamId: string,
    channelId: string,
    fileName: string
  ) => Promise<BackendFile>;
  channels: Channel[];
  selectedFile: File | null;
  teamId: string;
  onFileSelect?: (file: File) => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  channels,
  selectedFile,
  teamId,
  onFileSelect,
}) => {
  const [fileName, setFileName] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedFile) {
      setFileName(selectedFile.name);
    }
  }, [selectedFile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect?.(file);
      setFileName(file.name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedChannel) {
      setError("Please select a file and channel");
      return;
    }

    setIsUploading(true);
    setError(null);

    //renamed file creation
    const renamedFile = new File([selectedFile], fileName, {
      type: selectedFile.type,
    });

    try {
      const response = await onUpload(
        renamedFile,
        teamId,
        selectedChannel,
        fileName
      );
      console.log("Upload response:", response);
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Upload File</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select File
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <FiUpload className="mr-2" />
                Choose File
              </button>
              <span className="text-sm text-gray-500">
                {selectedFile?.name || "No file selected"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Name
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter file name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Channel
            </label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a channel</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedChannel || !fileName || isUploading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
              !selectedChannel || !fileName || isUploading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FileUploadModal;
