import { zoomToRFCRecurrence } from '../src/utils/calendar';
import { toEasternDTString } from '../src/utils/general';
import { renderMeetingCreated, sendEmail } from '../src/utils/gmail';
import { ZoomerMeetingRequest } from '../src/utils/zoom';

export const gmailTest = async () => {
  const datetime = toEasternDTString(meetingReq.start_time);
  const html = await renderMeetingCreated({
    topic: meetingReq.topic,
    agenda: meetingReq.agenda,
    host: 'Angel Campbell',
    hostJoinKey: '1232',
    meetingID,
    password: '1235124',
    reccurrence: zoomToRFCRecurrence(meetingReq.recurrence!).toText(),
    datetime,
  });

  const res = await sendEmail('angel.campbell@cogef.org', 'Testing4', html);
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
