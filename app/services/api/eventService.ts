import { api as axios } from "@/app/lib/api";
import {
  NewEventWithAttendees,
  NewEvent,
  EventAttendee,
} from "@/app/types/models_types/eventTypes";

/**
 * Creates a new event with optional attendees
 * @param eventData The event data with attendees
 * @returns The created event data
 */
export const createEvent = async (eventData: NewEventWithAttendees) => {
  try {
    const response = await axios.post("/api/events-add", eventData);
    return response.data;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

/**
 * Get events for a team
 * @param teamId The team ID to fetch events for
 * @returns Array of events for the team
 */
export const getTeamEvents = async (teamId: string) => {
  try {
    const response = await axios.get(`/api/events/team/${teamId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching team events:", error);
    throw error;
  }
};

/**
 * Get events for a channel
 * @param channelId The channel ID to fetch events for
 * @returns Array of events for the channel
 */
export const getChannelEvents = async (channelId: string) => {
  try {
    const response = await axios.get(`/api/events/channel/${channelId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching channel events:", error);
    throw error;
  }
};

/**
 * Update an attendee's status for an event
 * @param eventId The event ID
 * @param attendeeData The attendee data with updated status
 * @returns The updated attendee data
 */
export const updateAttendeeStatus = async (
  eventId: string,
  attendeeData: EventAttendee
) => {
  try {
    const response = await axios.put(
      `/api/events/${eventId}/attendees/${attendeeData.userId}`,
      attendeeData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating attendee status:", error);
    throw error;
  }
};

/**
 * Add attendees to an existing event
 * @param eventId The event ID
 * @param attendees Array of attendees to add
 * @returns The updated event with attendees
 */
export const addEventAttendees = async (
  eventId: string,
  attendees: EventAttendee[]
) => {
  try {
    const response = await axios.post(`/api/events/${eventId}/attendees`, {
      attendees,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding attendees to event:", error);
    throw error;
  }
};

/**
 * Remove an attendee from an event
 * @param eventId The event ID
 * @param userId The user ID to remove
 */
export const removeEventAttendee = async (eventId: string, userId: string) => {
  try {
    await axios.delete(`/api/events/${eventId}/attendees/${userId}`);
    return true;
  } catch (error) {
    console.error("Error removing attendee from event:", error);
    throw error;
  }
};
