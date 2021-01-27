import { ZoomerMeetingRequest } from '../src/utils/zoom';
import { getUser, scheduleMeeting } from '../src/utils/zoom/requests';

const meetingReq1: ZoomerMeetingRequest = {
  agenda: 'Super important meeting',
  duration: 180,
  ministry: 'cap',
  password: '3241',
  recurrence: { type: 2, repeat_interval: 1, weekly_days: '1,4,7', end_times: 6 },
  settings: {
    host_video: false,
    participant_video: false,
    join_before_host: true,
    mute_upon_entry: true,
    waiting_room: false,
  },
  start_time: '2021-01-24T22:00:00.000Z',
  topic: 'Important Meeting',
  type: 8,
};

const meetingReq2: ZoomerMeetingRequest = {
  agenda: 'Super important meeting about very important stuff',
  duration: 60,
  ministry: 'cap',
  password: '2341',
  settings: {
    host_video: false,
    participant_video: false,
    join_before_host: true,
    mute_upon_entry: true,
    waiting_room: false,
  },
  start_time: '2021-01-24T23:30:00.000Z',
  topic: 'Important Meeting',
  type: 2,
};

const meetingReq = meetingReq2;
const user = 'angel.campbell@cogef.org';

export const zoomTest = async () => {
  scheduleMeeting(user, meetingReq).then(meeting => {
    console.log({ meeting });
  });
  //getMe().then(({ err, data }) => {
  //  if (err) {
  //    console.error({ err });
  //  } else {
  //    console.log({ data });
  //  }
  //});
};
