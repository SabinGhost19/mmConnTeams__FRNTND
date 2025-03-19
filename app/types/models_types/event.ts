export default interface Event {
  id: number;
  teamId: number;
  channelId: number;
  title: string;
  description: string;
  date: string;
  duration: number;
  attendees: number[];
}
