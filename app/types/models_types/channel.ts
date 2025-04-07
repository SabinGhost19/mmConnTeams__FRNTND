export default interface Channel {
  id: string;
  name: string;
  teamId: string;
  isPrivate: boolean;
  description: string;
  unreadCount: number;
  creatorId: string;
}
