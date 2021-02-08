import { auth } from '../src/services/firebase';
import { initGAPIs } from '../src/services/googleapis';
import { ZoomerMeetingRequest } from '../src/utils/zoom/types';
import { getMeeting, getOccurrences } from '../src/handlers/api/routes/meetings/handlers';
import { createMeeting } from '../src/handlers/api/routes/meetings/handlers/createMeeting';
import { deleteMeeting } from '../src/handlers/api/routes/meetings/handlers/deleteMeeting';
import util from 'util';
import { updateMeeting } from '../src/handlers/api/routes/meetings/handlers/updateMeeting';
import { DateTime } from 'luxon';

const meetingReq1: ZoomerMeetingRequest = {
  agenda: 'Super important test meeting',
  duration: 180,
  ministry: 'cap',
  password: '3241',
  recurrence: { type: 2, repeat_interval: 1, weekly_days: '5', end_times: 6 },
  settings: {
    host_video: false,
    participant_video: false,
    join_before_host: true,
    mute_upon_entry: true,
    waiting_room: false,
  },
  start_time: new Date('2/2/2021 6:00 PM').toISOString(),
  topic: 'Test Meeting Charlie',
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
    end_date_time: new Date('2/20/2021 11:59 PM').toISOString(),
  },
  settings: {
    host_video: false,
    participant_video: false,
    join_before_host: true,
    mute_upon_entry: true,
    waiting_room: false,
  },
  start_time: new Date('2/9/2021 2:00 PM').toISOString(),
  topic: 'Test Meeting Echo',
  type: 8,
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
    monthly_week_day: 5,
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
  topic: 'Test Meeting Garden',
};

const meetingReq = meetingReq2;
const meetingID = '93472282407';

export const fullTest = async () => {
  await initGAPIs();
  // The user requesting the meeting
  const user = await auth.getUser('eVgwiI6fgkVxMNXTtYuABmOgt7s2');
  try {
    //const res = await createMeeting(user, meetingReq);
    const res = await updateMeeting(user, meetingID, meetingReq);
    //const res = await getMeeting(user, meetingID);
    //const res = await deleteMeeting(user, meetingID);
    //const res = await getOccurrences(user, 'angel.campbell@cogef.org', {
    //  limit: 3,
    //  startDate: DateTime.local().startOf('day').toMillis(),
    //  //last: {
    //  //  meetingID: '96526535787',
    //  //  occurrenceID: '1612479600000',
    //  //},
    //});

    if (res.success) {
      console.log(util.inspect({ data: res.data }, false, 10));
      return;
    } else {
      console.error(util.inspect({ res }, false, 5));
      return;
    }
  } catch (err) {
    console.trace(err);
    return;
  }
};
