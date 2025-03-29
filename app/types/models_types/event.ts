export default interface Event {
  id: string;
  teamId: string;
  channelId: string;
  title: string;
  description: string;
  date: string;
  duration: number;
  attendees: number[];
}
