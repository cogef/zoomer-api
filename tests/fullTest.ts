import { auth } from '../src/services/firebase';
import { initGAPIs } from '../src/services/googleapis';
import { ZoomerMeetingRequest } from '../src/utils/zoom/types';
import { getMeeting } from '../src/web-server/routes/meetings/handlers';
import { createMeeting } from '../src/web-server/routes/meetings/handlers/createMeeting';
import { deleteMeeting } from '../src/web-server/routes/meetings/handlers/deleteMeeting';
import util from 'util';

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
  recurrence: {
    type: 1,
    repeat_interval: 1,
    end_date_time: '2021-04-28T04:57:00.000Z',
  },
  settings: {
    host_video: false,
    participant_video: false,
    join_before_host: true,
    mute_upon_entry: true,
    waiting_room: false,
  },
  start_time: '2021-01-24T23:30:00.000Z',
  topic: 'Important Meeting',
  type: 8,
};

const meetingReq = meetingReq2;

export const fullTest = async () => {
  await initGAPIs();
  // The user requesting the meeting
  const user = await auth.getUser('eVgwiI6fgkVxMNXTtYuABmOgt7s2');
  try {
    //const res = await createMeeting(user, meetingReq);
    const res = await getMeeting(user, '99165313619');
    //const res = await deleteMeeting(user, '94233423438');
    if (res.success) {
      console.log(util.inspect({ data: res.data }, false, 10));
    } else {
      console.error({ err: res.error });
    }
  } catch (err) {
    console.trace(err);
  }
};
