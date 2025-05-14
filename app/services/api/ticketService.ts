import { api as axios } from "@/app/lib/api";
import Ticket, { TicketDTO } from "@/app/types/models_types/ticket";

// Format the ticket data for API requests
const formatTicketForApi = (ticket: TicketDTO): any => {
  return {
    id: ticket.id,
    userId: ticket.userId,
    sourceId: ticket.sourceId,
    channelId: ticket.channelId,
    destinationId: ticket.destinationId,
    title: ticket.title,
    purpose: ticket.purpose,
    description: ticket.description,
    deadline: ticket.deadline,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
};

// Parse the ticket data from API responses
const parseTicketFromApi = (data: any): Ticket => {
  return {
    id: data.id,
    userId: data.userId,
    sourceId: data.sourceId,
    channelId: data.channelId,
    destinationId: data.destinationId,
    title: data.title,
    purpose: data.purpose,
    description: data.description,
    deadline: data.deadline,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

// get all tickets
export const getAllTickets = async (): Promise<Ticket[]> => {
  const response = await axios.get<any[]>("/api/tickets");
  return response.data.map(parseTicketFromApi);
};

// get ticket by id
export const getTicketById = async (id: string): Promise<Ticket> => {
  const response = await axios.get<any>(`/api/tickets/${id}`);
  return parseTicketFromApi(response.data);
};

// get tickets by source id
export const getTicketsBySourceId = async (): Promise<Ticket[]> => {
  const response = await axios.get<any[]>(`/api/tickets/source`);
  return response.data.map(parseTicketFromApi);
};

// get tickets by destination id
export const getTicketsByDestinationId = async (): Promise<Ticket[]> => {
  const response = await axios.get<any[]>(`/api/tickets/destination`);
  return response.data.map(parseTicketFromApi);
};

// get tickets by channel id
export const getTicketsByChannelId = async (
  channelId: string
): Promise<Ticket[]> => {
  const response = await axios.get<any[]>(`/api/tickets/channel/${channelId}`);
  return response.data.map(parseTicketFromApi);
};

// create ticket
export const createTicket = async (ticketDTO: TicketDTO): Promise<Ticket> => {
  const formattedTicket = formatTicketForApi(ticketDTO);
  const response = await axios.post<any>("/api/tickets", formattedTicket);
  return parseTicketFromApi(response.data);
};

// update ticket
export const updateTicket = async (
  id: string,
  ticketDTO: TicketDTO
): Promise<Ticket> => {
  const formattedTicket = formatTicketForApi(ticketDTO);
  const response = await axios.put<any>(`/api/tickets/${id}`, formattedTicket);
  return parseTicketFromApi(response.data);
};

// delete ticket
export const deleteTicket = async (id: string): Promise<void> => {
  await axios.delete(`/api/tickets/${id}`);
};

// delete tickets by channel id
export const deleteTicketsByChannelId = async (
  channelId: string
): Promise<void> => {
  await axios.delete(`/api/tickets/channel/${channelId}`);
};
