import { addHours, addMinutes } from 'date-fns';
import * as Calendar from '../../../utils/calendar';
import * as DB from '../../../utils/db';
import * as Zoom from '../../../utils/zoom';
import { HandlerResponse } from '../types';

export const createMeeting = async (meetingReq: Zoom.ZoomerMeetingRequest): Promise<HandlerResponse> => {
  const startDT = meetingReq.start_time;
  const endDT = addMinutes(new Date(startDT), meetingReq.duration).toISOString();
  const accounts = await DB.getZoomAccounts();

  const hourBefore = addHours(new Date(startDT), -1).toISOString();
  const hourAfter = addHours(new Date(startDT), 1).toISOString();

  const freeIdx = await Calendar.findFirstFree(hourBefore, hourAfter, accounts);
  const account = accounts[freeIdx];

  if (account) {
    const meeting = await Zoom.scheduleMeeting(account.email, meetingReq);

    const eventDesc = `${meetingReq.agenda}\n\n----------------------\nScheduled on ${account.email}`;

    const eventReq = {
      title: meetingReq.topic,
      description: eventDesc,
      start: startDT,
      end: endDT,
      recurrence: meetingReq.recurrence ? Calendar.zoomToRFCRecurrence(meetingReq.recurrence) : undefined,
    };

    const zoomCalEventID = await Calendar.createEvent(account.calendarID, eventReq);
    //const [leaderCalErr, leaderCalEventID] = await createEvent(freeCal, eventReq);
    const leaderCalEventID = '~' + Math.random();

    await DB.storeEvent({
      zoomAccount: account.email,
      title: meetingReq.topic,
      description: meetingReq.agenda,
      startDate: new Date(startDT),
      endDate: new Date(endDT),
      meetingID: meeting.id,
      host: {
        ...meetingReq.host,
        ministry: meetingReq.ministry,
      },
      calendarEvents: {
        zoomEventID: zoomCalEventID!,
        leadershipEventID: leaderCalEventID!,
      },
    });

    return { success: true, data: { meetingID: meeting.id } };
  }

  console.log('No calendars free');
  return { success: false, error: 'no calendars free' };
};
