import { addHours, addMinutes } from 'date-fns';
import { User } from '../../../../../utils/auth';
import * as Calendar from '../../../../../utils/calendar';
import * as DB from '../../../../../utils/db';
import * as Zoom from '../../../../../utils/zoom';
import { HandlerResponse } from '../../../helpers';
import { isAuthorized } from '../helpers';

export const updateMeeting = async (
  user: User,
  meetingID: string,
  meetingReq: Zoom.ZoomerMeetingRequest
): Promise<HandlerResponse> => {
  const dbEvent = await DB.getEvent(meetingID);
  if (!dbEvent) {
    return { success: false, error: 'meeting not found in db', code: 404 };
  }

  if (!isAuthorized(dbEvent, user)) {
    return { success: false, error: 'not authorized to access meeting', code: 401 };
  }

  const zoomAcc = await DB.getZoomAccount(dbEvent.zoomAccount);

  //TODO: Change create logic to update logic

  const startDT = meetingReq.start_time;
  const endDT = addMinutes(new Date(startDT), meetingReq.duration).toISOString();
  const accounts = await DB.getZoomAccounts();

  const hourBefore = addHours(new Date(startDT), -1).toISOString();
  const bufferDuration = meetingReq.duration + 120; // buffer duration includes hour before and after

  const rrule = meetingReq.recurrence ? Calendar.zoomToRFCRecurrence(meetingReq.recurrence, hourBefore) : undefined;

  const freeIdx = await Calendar.findFirstFree(hourBefore, bufferDuration, accounts, rrule);
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

    const occurrences = meeting.occurrences || [
      {
        occurance_id: String(meeting.id),
        start_time: meeting.start_time,
        duration: meeting.duration,
        status: '',
        isSeudo: true as const,
      },
    ];

    await DB.storeEvent(
      {
        zoomAccount: account.email,
        title: meetingReq.topic,
        description: meetingReq.agenda,
        startDate: new Date(startDT),
        endDate: new Date(endDT),
        meetingID: String(meeting.id),
        hostJoinKey: dbEvent.hostJoinKey,
        host: {
          name: user.displayName!,
          email: user.email!,
          ministry: meetingReq.ministry,
        },
        calendarEvents: {
          zoomEventID: zoomCalEventID!,
          leadershipEventID: leaderCalEventID!,
        },
      },
      occurrences
    );

    return { success: true, data: { meetingID: meeting.id } };
  }

  console.log('No calendars free');
  return { success: false, error: 'no calendars free' };
};