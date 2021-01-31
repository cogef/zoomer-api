import { firestore } from 'firebase-admin';
import { MeetingOccurance } from '../zoom';

export type MeetingInfo = {
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

export type StoredMeeting = {
  createdAt: firestore.Timestamp;
  startDate: firestore.Timestamp;
  endDate: firestore.Timestamp;
} & Omit<MeetingInfo, 'startDate' | 'endDate'>;

export type OccurrenceInfo = { isSeudo?: true } & MeetingOccurance;

export type StoredOccurrence = {
  occurrenceID: string;
  meetingID: string;
  startDate: firestore.Timestamp;
  endDate: firestore.Timestamp;
  hostEmail: string;
  isSeudo: boolean;
};

export type ZoomAccount = { calendarID: string; sequence: number; email: string };
