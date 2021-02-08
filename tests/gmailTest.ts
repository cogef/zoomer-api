import { zoomToRFCRecurrence } from '../src/utils/calendar';
import { renderMeetingCreated, sendEmail } from '../src/utils/gmail';
import { ZoomerMeetingRequest } from '../src/utils/zoom';

export const gmailTest = async () => {
  const html = await renderMeetingCreated({
    topic: meetingReq.topic,
    agenda: meetingReq.agenda,
    host: 'Angel Campbell',
    hostJoinKey: '12322',
    meetingID,
    password: '1235124',
    reccurrence: zoomToRFCRecurrence(meetingReq.recurrence!).toText(),
    startTime: meetingReq.start_time,
    joinURL: 'https://cogef-org.zoom.us/j/98313795612?pwd=emhVWWkremZHU2VlSHlIQ1ZmU2JUdz09',
    dialIns: meeting.settings.global_dial_in_numbers,
  });

  const res = await sendEmail('angel.campbell@cogef.org', 'Testing5', html);
  console.log({ res });
};

const meetingReq3: ZoomerMeetingRequest = {
  agenda: 'Super important end of month stuff',
  duration: 90,
  ministry: 'media',
  password: '2341',
  type: 8,
  recurrence: {
    type: 3,
    repeat_interval: 1,
    monthly_week: -1,
    monthly_week_day: 1,
    end_date_time: new Date('3/28/2021 11:59 PM').toISOString(),
  },
  settings: {
    host_video: false,
    participant_video: false,
    join_before_host: true,
    mute_upon_entry: false,
    waiting_room: false,
    auto_recording: 'local',
  },
  start_time: new Date('2/5/2021 5:30 PM').toISOString(),
  topic: 'Test Meeting New Foxtrot',
};

const meetingReq = meetingReq3;
const meetingID = '96006187948';

const meeting = {
  uuid: 'hzbZBjd8TyyWLGILLFnuHg==',
  id: 98313795612,
  host_id: 'ZAqG-qUkT-GJxVOd3mCcOQ',
  host_email: 'outreachchairs@cogef.org',
  assistant_id: '',
  topic: 'Test Meeting Garden',
  type: 8,
  status: 'waiting',
  timezone: 'America/New_York',
  agenda: 'Super important end of month stuff',
  created_at: '2021-02-06T04:31:23Z',
  start_url:
    'https://cogef-org.zoom.us/s/98313795612?zak=eyJ6bV9za20iOiJ6bV9vMm0iLCJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJjbGllbnQiLCJ1aWQiOiJaQXFHLXFVa1QtR0p4Vk9kM21DY09RIiwiaXNzIjoid2ViIiwic3R5IjoxMDAsIndjZCI6ImF3MSIsImNsdCI6MCwic3RrIjoiRVhDeUpwSGlUV01GbE05bEVNZjhyc015U0d4SS1DV1F6NnRQTFFKV0kyay5CZ1lzTm14d2FISnlRVkJzVFhWYVRIYzVhSGd3Yms5WWRIZGhWVm9yU2t4TFpEVnpRMHh3Ym5CRk9EUnFUVDFBTmpNME5qUTBOMkZrTkRWa01ETXhPR0l3WkRZMk9USmxZekZqWkdJNE5qZzVNRFZrTXprMFltTm1ZMk5pTXprelptRXlOemM0T1dWaVpqZzFabVpqTVFBTU0wTkNRWFZ2YVZsVE0zTTlBQU5oZHpFQUFBRjNkZk9lclFBU2RRQUFBQSIsImV4cCI6MTYxMjU5ODgzNiwiaWF0IjoxNjEyNTkxNjM2LCJhaWQiOiJtNVRoY0l6U1F5V0tvNjNLWXdJTFdBIiwiY2lkIjoiIn0.ljMzHbAaz6RoYU2ZyuoP6-KY38WB4vIq8GxT34eVN1M',
  join_url: 'https://cogef-org.zoom.us/j/98313795612?pwd=emhVWWkremZHU2VlSHlIQ1ZmU2JUdz09',
  password: '2341',
  h323_password: '2341',
  pstn_password: '2341',
  encrypted_password: 'emhVWWkremZHU2VlSHlIQ1ZmU2JUdz09',
  occurrences: [
    { occurrence_id: '1614298500000', start_time: '2021-02-26T00:15:00Z', duration: 90, status: 'available' },
    { occurrence_id: '1616714100000', start_time: '2021-03-25T23:15:00Z', duration: 90, status: 'available' },
  ],
  settings: {
    host_video: false,
    participant_video: false,
    cn_meeting: false,
    in_meeting: false,
    join_before_host: true,
    jbh_time: 0,
    mute_upon_entry: false,
    watermark: false,
    use_pmi: false,
    approval_type: 2,
    audio: 'both',
    auto_recording: 'local',
    enforce_login: false,
    enforce_login_domains: '',
    alternative_hosts: '',
    close_registration: false,
    show_share_button: false,
    allow_multiple_devices: false,
    registrants_confirmation_email: true,
    waiting_room: false,
    request_permission_to_unmute_participants: false,
    global_dial_in_countries: ['US'],
    global_dial_in_numbers: [
      { country_name: 'US', number: '+1 2532158782', type: 'toll', country: 'US' },
      { country_name: 'US', number: '+1 3017158592', type: 'toll', country: 'US' },
      { country_name: 'US', number: '+1 3126266799', type: 'toll', country: 'US' },
      { country_name: 'US', number: '+1 3462487799', type: 'toll', country: 'US' },
      { country_name: 'US', number: '+1 6699006833', type: 'toll', country: 'US' },
      { country_name: 'US', number: '+1 9294362866', type: 'toll', country: 'US' },
    ],
    registrants_email_notification: true,
    meeting_authentication: false,
    encryption_type: 'enhanced_encryption',
    approved_or_denied_countries_or_regions: { enable: false },
    breakout_room: { enable: false },
  },
  recurrence: {
    type: 3,
    repeat_interval: 1,
    monthly_week: -1,
    monthly_week_day: 5,
    end_date_time: '2021-03-29T03:59:00Z',
  },
  start_time: '2021-02-26T00:15:00Z',
  duration: 90,
  ministry: 'media',
};
