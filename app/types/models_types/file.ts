export default interface File {
  id: number;
  teamId: number;
  channelId: number;
  name: string;
  type: string;
  size: string;
  uploadedBy: number;
  uploadedAt: string;
  url: string;
}
