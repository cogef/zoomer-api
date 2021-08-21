import { MinistryKey } from '../general';

// -

// type BaseMeeting = BaseSingleMeeting | BaseRecurringMeeting;

interface BaseMeetingRequest {
  topic: string;
  type: number; // 1 | 2 (scheduled) | 3 | 8 (recurring);
  start_time: string; // [date-time];
  duration: number; // in mins
  schedule_for?: never;
  timezone?: never;
  password: string;
  agenda: string; // description
  settings: {
    host_video: boolean;
    participant_video: boolean;
    cn_meeting?: never; // boolean;
    in_meeting?: never; // boolean;
    join_before_host: boolean;
    mute_upon_entry: boolean;
    watermark?: never; // boolean;
    use_pmi?: never; // boolean;
    approval_type?: never; // 0 | 1 | 2 (default, no registration);
    registration_type?: never; // 1  | 2 | 3;
    audio?: never; //'both' (default) | 'telephony' | 'voip';
    auto_recording?: 'local'; //'local' | 'cloud' | 'none';
    alternative_hosts?: never; // string;
    waiting_room: boolean;
    global_dial_in_countries?: never; //string[];
    registrants_email_notification?: never; // boolean;
  };
}

interface SingleMeetingRequest extends BaseMeetingRequest {
  recurrence?: never;
}

interface RecurringMeetingRequest extends BaseMeetingRequest {
  recurrence?: {
    type: 1 | 2 | 3; // 1 (daily) | 2 (weekly) | 3 (monthly)
    repeat_interval: number;
    weekly_days?: string;
    monthly_day?: number;
    monthly_week?: -1 | 1 | 2 | 3 | 4;
    monthly_week_day?: number;
    end_times?: number;
    end_date_time?: string; //  [date-time];
  };
}

export type ZoomMeetingRequest = SingleMeetingRequest | RecurringMeetingRequest;

interface ZoomerProps {
  ministry: MinistryKey;
}

export type ZoomerMeetingRequest = ZoomerProps & ZoomMeetingRequest;

interface BaseMeeting<T extends ZoomMeetingRequest>
  extends Omit<BaseMeetingRequest, 'schedule_for' | 'start_time' | 'timezone'> {
  uuid: string;
  id: number;
  host_id: string;
  assistant_id?: string; // [schedule_for from request]
  host_email: string;
  created_at: string;
  timezone: string;
  start_url: string;
  join_url: string;
  password: string;
  recurrence?: T['recurrence'];
  // occurrences?: MeetingOccurance[];
  settings: BaseMeetingRequest['settings'] & {
    global_dial_in_numbers: {
      country: string;
      country_name: string;
      city?: string;
      number: string;
      type: string;
    }[];
  };
}

export interface SingleMeeting extends BaseMeeting<SingleMeetingRequest> {
  type: 2;
  start_time: string;
  occurrences?: never;
}

export interface RecurringMeeting extends BaseMeeting<RecurringMeetingRequest> {
  type: 3;
  start_time?: never;
  occurrences: MeetingOccurance[];
}

export type ZoomMeeting = SingleMeeting | RecurringMeeting;

export interface MeetingOccurance {
  occurrence_id: string;
  start_time: string;
  duration: number;
  status: string;
}

export interface ZoomUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  type: string;
  host_key: string;
}

export interface ZoomMeetingRecording {
  uuid: string;
  id: string;
  account_id: string;
  host_id: string;
  topic: string;
  start_time: string;
  duration: number;
  total_size: string;
  type: '1' | '2' | '3' | '8';
  recording_count: string;
  share_url: string;
  recording_files: {
    id: string;
    meeting_id: string;
    recording_start: string;
    recording_end: string;
    file_type: string;
    file_size: string;
    play_url: string;
    download_url: string;
    status: string;
    deleted_time: string;
    recording_type: string;
  }[];
}

export interface UserRecordings {
  from: string;
  to: string;
  page_count: number;
  page_size: number;
  total_records: number;
  next_page_token: string;
  meetings: ZoomMeetingRecording[];
}

interface BaseZoomEvent<T extends Object> {
  event: string;
  payload: {
    account_id: string;
    object: T;
  };
}

export interface MeetingEndedEvent
  extends BaseZoomEvent<{
    uuid: string;
    id: number;
    host_id: number;
    type: number;
    topic: string;
    start_time: string;
    timezone: string;
    /** Scheduled meeting duration */
    duration: number;
    end_time: string;
  }> {
  event: 'meeting.ended';
}

export interface RecordingCompletedEvent
  extends BaseZoomEvent<{
    uuid: string;
    id: number;
    host_id: number;
    topic: string;
    type: number;
    start_time: string;
    duration: number;
    timezone: string;
    host_email: string;
    total_size: number;
    recording_count: number;
    share_url: string;
    recording_files: {}[];
  }> {
  event: 'recording.completed';
}

export interface UnsupportedEvent extends BaseZoomEvent<any> {
  event: 'unsupported';
}

export type ZoomEvent = MeetingEndedEvent | RecordingCompletedEvent | UnsupportedEvent;

export interface ZoomMeetingInstance {
  uuid: string;
  id: number;
  host_id: number;
  type: number;
  topic: string;
  user_name: string;
  user_email: string;
  start_time: string;
  end_time: string;
  duration: number;
  /** Sum of meeting minutes from all participants in the meeting */
  total_minutes: number;
  participants_count: number;
}

export interface ZoomMeetingInstanceList {
  meetings: {
    uuid: string;
    start_time: string;
  }[];
}
