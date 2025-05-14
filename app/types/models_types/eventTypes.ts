export interface NewEvent {
  teamId: string;
  channelId: string;
  title: string;
  description?: string;
  eventDate: string;
  duration: number;
  createdBy: string;
}

export interface EventAttendee {
  userId: string;
  status?: "pending" | "accepted" | "declined" | "maybe";
}

export interface NewEventWithAttendees {
  event: NewEvent;
  attendees?: EventAttendee[];
}

export enum AttendeeStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
  MAYBE = "maybe",
}
