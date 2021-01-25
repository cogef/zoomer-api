import { initGAPIs } from '../src/services/googleapis';
import { ZoomerMeetingRequest } from '../src/utils/zoom/types';
import { createMeeting } from '../src/web-server/routes/meetings/createMeeting';
import { deleteMeeting } from '../src/web-server/routes/meetings/deleteMeeting';

const meetingReq1: ZoomerMeetingRequest = {
  agenda: 'Super important meeting',
  duration: 180,
  host: { name: 'Angel Campbell', email: 'angel.campbell@cogef.org' },
  ministry: 'cap',
  password: '3241',
  recurrence: { type: 2, repeat_interval: 1, weekly_days: '1,4,7', end_times: 6 },
  settings: { host_video: false, participant_video: false, join_before_host: true, mute_upon_entry: true },
  start_time: '2021-01-24T22:00:00.000Z',
  topic: 'Important Meeting',
  type: 8,
};

const meetingReq2: ZoomerMeetingRequest = {
  agenda: 'Super important meeting about very important stuff',
  duration: 60,
  host: { name: 'Angel Campbell', email: 'angel.campbell@cogef.org' },
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
  },
  start_time: '2021-01-24T23:30:00.000Z',
  topic: 'Important Meeting',
  type: 8,
};

const meetingReq = meetingReq2;

export const fullTest = async () => {
  await initGAPIs();
  try {
    //const res = await createMeeting(meetingReq);
    const res = await deleteMeeting('91927318475');
    if (res.success) {
      console.log({ data: res.data });
    } else {
      console.error({ err: res.error });
    }
  } catch (err) {
    console.trace(err);
  }
};
