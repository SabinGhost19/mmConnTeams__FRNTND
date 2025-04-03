import Channel from "./channel";

export default interface Team {
  id: string;
  name: string;
  iconUrl: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  messageNr: number;
  reactionNr: number;
  channelNr: number;
  icon?: string;
  unreadCount?: number;
  members?: string[];
  channels?: Channel[];
}
