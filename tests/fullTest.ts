import { initGAPIs } from '../src/services/googleapis';
import { createEvent, findFirstFree, getZoomCals } from '../src/utils/calendar';
import { zoomToRFCRecurrence } from '../src/utils/calendar/recurrence';
import { ZoomerMeetingRequest } from '../src/utils/zoom/types';
import { addMinutes } from 'date-fns';
import { storeEvent } from '../src/utils/db';

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

const startDT = meetingReq.start_time;
const endDT = addMinutes(new Date(startDT), meetingReq.duration).toISOString();

export const fullTest = async () => {
  console.log({ rrule: meetingReq.recurrence ? zoomToRFCRecurrence(meetingReq.recurrence) : undefined });
  try {
    await initGAPIs();
    const cals = await getZoomCals();
    const freeCal = await findFirstFree(startDT, endDT, cals);
    if (freeCal) {
      const [err, zCalEventID] = await createEvent(freeCal, {
        title: meetingReq.topic,
        description: meetingReq.agenda,
        start: startDT,
        end: endDT,
        recurrence: meetingReq.recurrence ? zoomToRFCRecurrence(meetingReq.recurrence) : undefined,
      });

      if (err) {
        console.log(err.errors);
        return;
      }

      // Create Zoom meeting
      const meetingID = '~124' + Math.random(); // createZoomMeeting

      await storeEvent({
        zoomAccount: freeCal.zoomNum,
        title: meetingReq.topic,
        description: meetingReq.agenda,
        startDate: new Date(startDT),
        endDate: new Date(endDT),
        meetingID,
        host: {
          ...meetingReq.host,
          ministry: meetingReq.ministry,
        },
        calendarEvents: {
          zoomEventID: zCalEventID!,
          leadershipEventID: '~124',
        },
      });

      console.log({ zCalEventID });
    }

    console.log({ cals, freeCal });
  } catch (err) {
    console.error(err);
  }
};
