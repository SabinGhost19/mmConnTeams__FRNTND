export interface FileDTO {
  id: string;
  teamId: string;
  channelId: string;
  uploadedById: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  awsS3Key: string;
  url: string;
  uploadedAt: string;
}

export interface ReactionDTO {
  id: string;
  messageId: string;
  userId: string;
  channelId: string;
  reactionType: string;
  action: "add" | "remove";
}

export interface MessageDTO {
  id: string;
  channelId: string;
  senderId: string;
  senderName?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  attachments: FileDTO[];
  reactions: ReactionDTO[];
  isRead: boolean;
}

export interface Channel {
  id: string;
  name: string;
  teamId: string;
  isPrivate: boolean;
  description: string;
  unreadCount: number;
}

export interface Team {
  id: string;
  name: string;
  icon: string;
  description: string;
  unreadCount: number;
  members: string[];
  channels: Channel[];
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  avatar?: string;
  status: "online" | "offline" | "away" | "busy";
}
