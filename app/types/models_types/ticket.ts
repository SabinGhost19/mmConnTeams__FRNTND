export default interface Ticket {
  id: string;
  userId: string;
  channelId: string;
  sourceId: string;
  destinationId: string;
  title: string;
  deadline?: string;
  purpose?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketDTO {
  id?: string;
  userId: string;
  sourceId: string;
  channelId: string;
  destinationId: string;
  title: string;
  deadline?: string;
  purpose?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}
