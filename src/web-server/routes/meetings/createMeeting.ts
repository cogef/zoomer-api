import { addMinutes, addHours } from 'date-fns';
import { findFirstFree, createEvent } from '../../../utils/calendar';
import { zoomToRFCRecurrence } from '../../../utils/calendar/recurrence';
import { getZoomAccounts, storeEvent } from '../../../utils/db';
import { ZoomerMeetingRequest } from '../../../utils/zoom';
import { scheduleMeeting } from '../../../utils/zoom/requests';
import { HandlerResponse } from '../types';

export const createMeeting = async (meetingReq: ZoomerMeetingRequest): Promise<HandlerResponse> => {
  const startDT = meetingReq.start_time;
  const endDT = addMinutes(new Date(startDT), meetingReq.duration).toISOString();
  const accounts = await getZoomAccounts();

  const hourBefore = addHours(new Date(startDT), -1).toISOString();
  const hourAfter = addHours(new Date(startDT), 1).toISOString();

  const freeIdx = await findFirstFree(hourBefore, hourAfter, accounts);
  const account = accounts[freeIdx];

  if (account) {
    const meeting = await scheduleMeeting(account.email, meetingReq);

    const eventDesc = `${meetingReq.agenda}\n\n----------------------\nScheduled on ${account.email}`;

    const eventReq = {
      title: meetingReq.topic,
      description: eventDesc,
      start: startDT,
      end: endDT,
      recurrence: meetingReq.recurrence ? zoomToRFCRecurrence(meetingReq.recurrence) : undefined,
    };

    const zoomCalEventID = await createEvent(account.calendarID, eventReq);
    //const [leaderCalErr, leaderCalEventID] = await createEvent(freeCal, eventReq);
    const leaderCalEventID = '~' + Math.random();

    await storeEvent({
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
