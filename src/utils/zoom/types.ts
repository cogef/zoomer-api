import { MinistryKey } from '../general';

export type ZoomMeetingRequest = {
  topic: string;
  type: 2 | 8; // 1 | 2 (scheduled) | 3 | 8 (recurring);
  start_time: string; // [date-time];
  duration: number; // in mins
  schedule_for?: never; // string;
  timezone?: string;
  password: string;
  agenda: string; // description
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
    enforce_login?: never; // boolean;
    enforce_login_domains?: never; // string;
    alternative_hosts?: never; // string;
    waiting_room: boolean;
    global_dial_in_countries?: never; //string[];
    registrants_email_notification?: never; // boolean;
  };
};

type ZoomerProps = {
  ministry: MinistryKey;
};

export type ZoomerMeetingRequest = ZoomerProps & ZoomMeetingRequest;

export type ZoomMeeting = {
  uuid: string;
  id: number;
  host_id: string;
  assistant_id?: string;
  host_email: string;
  created_at: string;
  start_url: string;
  join_url: string;
  password: string;
  occurrences?: MeetingOccurance[];
  settings: {
    global_dial_in_numbers: {
      country: string;
      country_name: string;
      city?: string;
      number: string;
      type: string;
    }[];
  };
} & ZoomMeetingRequest;

export type ZoomerMeeting = ZoomerProps & ZoomMeeting & { share_url?: string | null };

export type MeetingOccurance = {
  occurrence_id: string;
  start_time: string;
  duration: number;
  status: string;
};

export type ZoomUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  type: string;
  host_key: string;
};

export type ZoomMeetingRecording = {
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
  };
};
