import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Channel from "@/app/types/models_types/channel";
import { FiUpload } from "react-icons/fi";

interface FileData {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  channelId: string;
  type?: string;
}

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (
    file: Blob,
    teamId: string,
    channelId: string,
    fileName: string
  ) => Promise<any>;
  channels: Channel[];
  selectedFile: globalThis.File | null;
  teamId: string;
  onFileSelect?: (file: globalThis.File) => void;
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
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedFile) {
      // Get the file name without extension
      const originalName = selectedFile.name;
      const lastDotIndex = originalName.lastIndexOf(".");
      const nameWithoutExtension =
        lastDotIndex > 0
          ? originalName.substring(0, lastDotIndex)
          : originalName;
      setFileName(nameWithoutExtension);
    }
  }, [selectedFile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedChannel || !fileName) return;

    try {
      setIsUploading(true);
      // Get the file extension from the original file
      const originalName = selectedFile.name;
      const lastDotIndex = originalName.lastIndexOf(".");
      const extension =
        lastDotIndex > 0 ? originalName.substring(lastDotIndex) : "";

      // Create a new file with the updated name
      const newFileName = fileName + extension;
      const newFile = new File([selectedFile], newFileName, {
        type: selectedFile.type,
        lastModified: selectedFile.lastModified,
      });

      await onUpload(newFile, teamId, selectedChannel, newFileName);
      onClose();
    } catch (error) {
      console.error("Error uploading file:", error);
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
