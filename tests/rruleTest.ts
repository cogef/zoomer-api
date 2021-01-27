import { rrulestr } from 'rrule';
import { zoomToRFCRecurrence } from '../src/utils/calendar';
import { ZoomerMeetingRequest } from '../src/utils/zoom';
import util from 'util';

const meetingReq: ZoomerMeetingRequest = {
  agenda: 'Super important meeting about very important stuff',
  duration: 60,
  ministry: 'cap',
  password: '2341',
  recurrence: {
    type: 1,
    repeat_interval: 1,
    end_date_time: '2021-02-18T04:57:00.000Z',
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

export const rruleTest = () => {
  const rruleStr = zoomToRFCRecurrence(meetingReq.recurrence!, meetingReq.start_time);
  const rrule = rrulestr(rruleStr);
  const dates = rrule.all();
  console.log(util.inspect(dates, false, 3));
};
