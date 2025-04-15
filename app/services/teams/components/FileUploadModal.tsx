import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Channel from "@/app/types/models_types/channel";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, channelId: string, fileName: string) => void;
  channels: Channel[];
  selectedFile: File | null;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  channels,
  selectedFile,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

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

  const handleUpload = async () => {
    if (!selectedFile || !selectedChannel) return;

    try {
      setIsUploading(true);
      await onUpload(selectedFile, selectedChannel, fileName);
      onClose();
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg p-6 w-full max-w-md"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold mb-4">Upload File</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Channel
            </label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full p-2 border rounded-md"
              disabled={isUploading}
            >
              <option value="">Select a channel</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Name
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full p-2 border rounded-md"
              disabled={isUploading}
              placeholder="Enter file name"
            />
            {selectedFile && (
              <p className="text-sm text-gray-500 mt-1">
                Original file: {selectedFile.name}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedChannel || !fileName || isUploading}
              className={`px-4 py-2 rounded-md ${
                isUploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FileUploadModal;
