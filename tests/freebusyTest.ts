import { initGAPIs } from '../src/services/googleapis';
import { findFirstFree, zoomToRFCRecurrence } from '../src/utils/calendar';
import { getZoomAccounts } from '../src/utils/db';
import { ZoomerMeetingRequest } from '../src/utils/zoom';

export const freebusyTest = async () => {
  await initGAPIs();
  const meetingReq: ZoomerMeetingRequest = {
    agenda: 'Super important meeting about very important stuff',
    duration: 60,
    ministry: 'cap',
    password: '2341',
    recurrence: {
      type: 1,
      repeat_interval: 1,
      end_date_time: new Date('1/31/2021 10:00 PM').toISOString(),
    },
    settings: {
      host_video: false,
      participant_video: false,
      join_before_host: true,
      mute_upon_entry: true,
      waiting_room: false,
    },
    start_time: new Date('1/24/2021 9:00 PM').toISOString(),
    topic: 'Important Meeting',
    type: 8,
  };

  const accounts = await getZoomAccounts();
  const rrule = zoomToRFCRecurrence(meetingReq.recurrence!, meetingReq.start_time);
  const freeIdx = await findFirstFree(meetingReq.start_time, meetingReq.duration, accounts, rrule);
  console.log({ freeAccount: accounts[freeIdx] });
};
