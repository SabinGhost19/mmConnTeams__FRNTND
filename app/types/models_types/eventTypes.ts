export interface NewEvent {
  teamId: string; // UUID
  channelId: string; // UUID
  title: string;
  description?: string; // Optional
  eventDate: string; // ISO format date string
  duration: number; // in minutes
  createdBy: string; // UUID of the user creating the event
}

export interface EventAttendee {
  userId: string; // UUID
  status?: "pending" | "accepted" | "declined" | "maybe"; // Optional, defaults to 'pending'
}

// For use when submitting a complete event with initial attendees
export interface NewEventWithAttendees {
  event: NewEvent;
  attendees?: EventAttendee[]; // Optional array of initial attendees
}

// For validation or display purposes
export enum AttendeeStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
  MAYBE = "maybe",
}
