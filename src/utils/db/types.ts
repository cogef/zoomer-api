import { firestore } from 'firebase-admin';
import { MinistryKey } from '../general';
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
    ministry: MinistryKey;
    email: string;
    name: string;
  };
  calendarEvents: {
    zoomEventID: string;
    masterEventID: string;
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
  host: {
    email: string;
    name: string;
    ministry: string;
  };
  isSeudo: boolean;
  sequence: number;
  totalOccurrences: number;
};

export type ZoomAccount = { calendarID: string; sequence: number; email: string };
