import Channel from "./channel";

export default interface Team {
  id: number;
  name: string;
  icon: string;
  description: string;
  unreadCount: number;
  members: number[];
  channels: Channel[];
}
