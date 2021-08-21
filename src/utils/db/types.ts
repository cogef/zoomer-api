import { firestore } from 'firebase-admin';
import { MinistryKey } from '../general';
import { MeetingOccurance, RecurringMeeting, SingleMeeting, ZoomMeetingInstance } from '../zoom';

interface ZoomerProps {
  zoomAccount: string;
  hostJoinKey: string;
  host: {
    ministry: MinistryKey;
    email: string;
    name: string;
  };
}

interface BaseZoomerMeeting {
  host: ZoomerProps['host'];
  share_url?: string | null;
}

interface SingleZoomerMeeting extends SingleMeeting, BaseZoomerMeeting {}
interface RecurringZoomerMeeting extends RecurringMeeting, BaseZoomerMeeting {}

export type ZoomerMeeting = SingleZoomerMeeting | RecurringZoomerMeeting;

export interface ZoomerMeetingInstance
  extends Omit<ZoomMeetingInstance, 'start_time' | 'end_time'>,
    Omit<ZoomerProps, 'hostJoinKey'> {
  start_time: Date;
  end_time: Date;
  description: string;
  calendarEventId: string;
  /** Link to cloud recording of meeting */
  share_url?: string;
}

export interface MeetingInfo extends ZoomerProps {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  meetingID: string;
  calendarEvents: {
    zoomEventID: string;
    masterEventID: string;
  };
  reccurrence?: string;
}

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
    ministry: MinistryKey;
  };
  isSeudo: boolean;
  sequence: number;
  totalOccurrences: number;
};

export type ZoomAccount = { calendarID: string; sequence: number; email: string };
