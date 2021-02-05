import { addDays, addMinutes, setHours } from 'date-fns';
import util from 'util';
import { initGAPIs } from '../src/services/googleapis';
import { allToUTC, createEvent, deleteEvent, restoreEvent, zoomToRFCRecurrence } from '../src/utils/calendar';
import { ZoomerMeetingRequest } from '../src/utils/zoom';

const meetingReq1: ZoomerMeetingRequest = {
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
  topic: 'Important Meeting',
  type: 8,
};

const meetingReq3: ZoomerMeetingRequest = {
  agenda: 'Super important meeting',
  duration: 180,
  ministry: 'cap',
  password: '3241',
  //recurrence: { type: 2, repeat_interval: 1, weekly_days: '2,3', end_date_time: '2021-02-10T01:00:00.000Z' },
  settings: {
    host_video: false,
    participant_video: false,
    join_before_host: true,
    mute_upon_entry: true,
    waiting_room: false,
  },
  start_time: new Date('2/5/2021 5:00 PM').toISOString(),
  topic: 'Test Event Bravo',
  type: 2,
};

const meetingReq = meetingReq3;

const z2CalID = 'c_3g75uhqs69pf9mh6t4hh260cb4@group.calendar.google.com';

export const calTest = async () => {
  await initGAPIs();
  const recur = meetingReq.recurrence;
  if (recur?.end_date_time) {
    recur.end_date_time = addDays(setHours(new Date(recur.end_date_time), 23), 1).toISOString();
  }
  const rrule = recur ? zoomToRFCRecurrence(recur) : null;
  //console.log(rrule.toString());

  //const id = await createEvent(z2CalID, {
  //  description: 'some rrule test',
  //  start: meetingReq.start_time,
  //  end: addMinutes(new Date(meetingReq.start_time), meetingReq.duration).toISOString(),
  //  title: 'Test Event Alpha',
  //  recurrence: rrule?.toString(),
  //});
  //console.log({ id });

  const res = await deleteEvent(z2CalID, 'tj38sl7sjnoidaqr59fsnddf78');
  //const res = await restoreEvent(z2CalID, 'tj38sl7sjnoidaqr59fsnddf78');

  console.log({ res });

  //const dates = allToUTC(rrule);
  //console.log(util.inspect(dates, false, 3));
  //console.log(rrule.toText());
  //console.log(rrule.toString());
};
