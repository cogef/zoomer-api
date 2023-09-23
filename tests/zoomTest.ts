import { stripFracSec } from '../src/utils/general';
import { ZoomerMeetingRequest } from '../src/utils/zoom';
import { cancelMeeting } from '../src/utils/zoom/requests';

const meetingReq1: ZoomerMeetingRequest = {
  agenda: 'Super important meeting',
  duration: 180,
  ministry: 'cap',
  password: '3241',
  recurrence: { type: 3, repeat_interval: 1, monthly_day: 4, end_date_time: '2021-03-10T01:00:00.000Z' },
  settings: {
    host_video: false,
    participant_video: false,
    join_before_host: true,
    mute_upon_entry: true,
    waiting_room: false,
  },
  start_time: '2021-01-24T22:30:00.000Z',
  topic: 'Test Meeting Charlie',
  type: 8,
};

const meetingReq2: ZoomerMeetingRequest = {
  agenda: 'Super important meeting',
  duration: 180,
  ministry: 'cap',
  password: '3241',
  recurrence: { type: 2, repeat_interval: 1, weekly_days: '2,3', end_date_time: '2021-02-10T01:00:00.000Z' },
  settings: {
    host_video: false,
    participant_video: false,
    join_before_host: true,
    mute_upon_entry: true,
    waiting_room: false,
  },
  start_time: '2021-02-03T01:00:00.000Z',
  topic: 'Important Delta',
  type: 8,
};

const meetingReq3: ZoomerMeetingRequest = {
  agenda: 'Super important meeting',
  duration: 180,
  ministry: 'cap',
  password: '3241',
  recurrence: { type: 1, repeat_interval: 1, end_date_time: '2021-02-08T01:30:00.000Z' },
  settings: {
    host_video: false,
    participant_video: false,
    join_before_host: true,
    mute_upon_entry: true,
    waiting_room: false,
  },
  start_time: '2021-02-04T01:00:00.000Z',
  topic: 'Test Meeting Echo',
  type: 8,
};

const meetingReq = meetingReq3;
const user = 'youthchairs@cogef.org';
//const user = 'angel.campbell@cogef.org';

meetingReq.start_time = stripFracSec(meetingReq.start_time);
if (meetingReq.recurrence?.end_date_time) {
  meetingReq.recurrence.end_date_time = stripFracSec(meetingReq.recurrence.end_date_time);
}

export const zoomTest = async () => {
  //scheduleMeeting(user, meetingReq)
  //  .then(meeting => {
  //    console.log({ meeting });
  //  })
  //  .catch(err => {
  //    console.log({ err });
  //  });

  //updateMeeting('99917065950', { ...meetingReq, topic: 'Updated Topic 1' }).catch(err => {
  //  console.log({ err });
  //});

  cancelMeeting('99917065950').catch(err => {
    console.log({ err });
  });

  //getMe().then(({ err, data }) => {
  //  if (err) {
  //    console.error({ err });
  //  } else {
  //    console.log({ data });
  //  }
  //});
};
