import { firestore } from 'firebase-admin';
import { MeetingOccurance } from '../zoom';

export type EventInfo = {
  zoomAccount: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  meetingID: string;
  hostJoinKey: string;
  host: {
    ministry: string;
    email: string;
    name: string;
  };
  calendarEvents: {
    zoomEventID: string;
    leadershipEventID: string;
  };
  reccurrence?: string;
};

export type StoredEvent = { createdAt: Date } & EventInfo;

export type OccurrenceInfo = { isSeudo?: true } & MeetingOccurance;

export type StoredOccurrence = {
  occurrenceID: string;
  meetingID: string;
  startDate: firestore.Timestamp | Date;
  endDate: firestore.Timestamp | Date;
  isSeudo: boolean;
};

export type ZoomAccount = { calendarID: string; sequence: number; email: string };
