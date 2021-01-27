import { addHours, addMinutes } from 'date-fns';
import randomString from 'randomstring';
import { User } from '../../../../utils/auth';
import * as Calendar from '../../../../utils/calendar';
import * as DB from '../../../../utils/db';
import * as Zoom from '../../../../utils/zoom';
import { HandlerResponse } from '../../../utils/';

export const createMeeting = async (user: User, meetingReq: Zoom.ZoomerMeetingRequest): Promise<HandlerResponse> => {
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
    const hostJoinKey = generateKey();

    const eventDesc =
      `DO NOT MODIFY THIS EVENT\n` +
      `-------------------------------\n\n` +
      `${meetingReq.agenda}\n\n` +
      `-------------------------------\n` +
      `Scheduled by ${user.email} on ${account.email}`;

    const eventReq = {
      title: meetingReq.topic,
      description: eventDesc,
      start: startDT,
      end: endDT,
      recurrence: meetingReq.recurrence ? Calendar.zoomToRFCRecurrence(meetingReq.recurrence) : undefined,
    };

    const zoomCalEventID = await Calendar.createEvent(account.calendarID, eventReq);
    //const [leaderCalErr, leaderCalEventID] = await createEvent(leaderCal, eventReq);
    const leaderCalEventID = '~' + Math.random();

    await DB.storeEvent({
      zoomAccount: account.email,
      title: meetingReq.topic,
      description: meetingReq.agenda,
      startDate: new Date(startDT),
      endDate: new Date(endDT),
      meetingID: meeting.id,
      hostJoinKey,
      host: {
        name: user.displayName!,
        email: user.email!,
        ministry: meetingReq.ministry,
      },
      calendarEvents: {
        zoomEventID: zoomCalEventID!,
        leadershipEventID: leaderCalEventID!,
      },
    });

    return { success: true, data: { meetingID: meeting.id, hostJoinKey }, code: 201 };
  }

  console.log('No calendars free');
  return { success: false, error: 'no calendars free', code: 409 };
};

const generateKey = () => {
  return randomString.generate({
    length: 5,
    charset: 'alphabetic',
    capitalization: 'lowercase',
    readable: true,
  });
};
