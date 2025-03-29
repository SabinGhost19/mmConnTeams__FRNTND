import Channel from "./channel";

export default interface Team {
  id: string;
  name: string;
  icon: string;
  description: string;
  unreadCount: number;
  members: string[];
  channels: Channel[];
}
