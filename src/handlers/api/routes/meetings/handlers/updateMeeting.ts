import { addHours, addMinutes } from 'date-fns';
import { User } from '../../../../../utils/auth';
import * as Calendar from '../../../../../utils/calendar';
import * as DB from '../../../../../utils/db';
import * as Zoom from '../../../../../utils/zoom';
import { attemptTo, HandlerResponse } from '../../../helpers';
import { isAuthorized } from '../helpers';

export const updateMeeting = async (
  user: User,
  meetingID: string,
  meetingReq: Zoom.ZoomerMeetingRequest
): Promise<HandlerResponse> => {
  const dbEvent = await DB.getMeeting(meetingID);
  if (!dbEvent) {
    return { success: false, error: 'meeting not found in db', code: 404 };
  }

  if (!isAuthorized(dbEvent.host.email, user.email!)) {
    return { success: false, error: 'not authorized to access meeting', code: 401 };
  }

  const startDT = meetingReq.start_time;
  const accounts = await DB.getZoomAccounts();

  const hourBefore = addHours(new Date(startDT), -1).toISOString();
  const bufferDuration = meetingReq.duration + 120; // buffer duration includes hour before and after

  const occursRrule = meetingReq.recurrence
    ? Calendar.zoomToRFCRecurrence(meetingReq.recurrence, hourBefore)
    : undefined;

  const oldAccount = accounts.find(acc => acc.email === dbEvent.zoomAccount);
  if (!oldAccount) {
    return {
      success: false,
      error: 'Could not find the Zoom account this meeting was scheduled with.\nPlease contact webadmins@cogef.org',
      code: 500,
    };
  }

  const [delCalErr] = await attemptTo('remove old calendar event', () =>
    Calendar.deleteEvent(oldAccount.calendarID, dbEvent.calendarEvents.zoomEventID)
  );
  if (delCalErr) return delCalErr;
  //await Calendar.deleteEvent(leaderShip, dbEvent.calendarEvents.leadershipEventID);

  const [sameFreeErrResp, sameFreeIdx] = await attemptTo('see if the same Zoom account is free', () =>
    Calendar.findFirstFree(hourBefore, bufferDuration, [oldAccount], occursRrule?.toString())
  );

  if (sameFreeErrResp) return sameFreeErrResp;
  const usingOldAccount = sameFreeIdx === 0;

  let account: DB.ZoomAccount;

  if (!usingOldAccount) {
    const [freeErrResp, freeIdx] = await attemptTo('find a free account', () =>
      Calendar.findFirstFree(hourBefore, bufferDuration, accounts, occursRrule?.toString())
    );

    if (freeErrResp) return freeErrResp;
    account = accounts[freeIdx!];
  } else {
    account = oldAccount;
  }

  if (account) {
    const [meetingErrResp, _meeting] = await attemptTo('update Zoom meeting', async () => {
      if (usingOldAccount) {
        await Zoom.updateMeeting(meetingID, meetingReq);
        return await Zoom.getMeeting(meetingID);
      } else {
        await Zoom.cancelMeeting(meetingID);
        return await Zoom.scheduleMeeting(account.email, meetingReq);
      }
    });

    if (meetingErrResp) return meetingErrResp;
    const meeting = _meeting!;

    const [userErrResp, _user] = await attemptTo('get host key', () => Zoom.getUser(account.email));

    if (userErrResp) return userErrResp;
    const zUser = _user!;

    const { host_key: hostKey } = zUser;
    const hostJoinKey = dbEvent.hostJoinKey;

    const eventDesc =
      `DO NOT MODIFY THIS EVENT\n` +
      `-------------------------------\n\n` +
      `${meetingReq.agenda}\n\n` +
      `-------------------------------\n` +
      `Scheduled by ${user.email} on ${account.email}\n` +
      `Meeting ID: ${meeting.id}\n` +
      `Password: ${meeting.password}\n` +
      `Host Key: ${hostKey}\n` +
      `Zoomer Host Join Key: ${hostJoinKey}\n`;

    const rrule = meetingReq.recurrence ? Calendar.zoomToRFCRecurrence(meetingReq.recurrence) : undefined;

    const occurrences = meeting.occurrences || [
      {
        occurrence_id: String(meeting.id),
        start_time: meeting.start_time,
        duration: meeting.duration,
        status: '',
        isSeudo: true as const,
      },
    ];

    // actual start time might not fall into reccurrence
    const firstOccur = occurrences[0].start_time;
    const eventReq = {
      title: meetingReq.topic,
      description: eventDesc,
      start: firstOccur,
      end: addMinutes(new Date(firstOccur), meetingReq.duration).toISOString(),
      recurrence: rrule?.toString(),
    };

    const [zCalErrResp, zoomCalEventID] = await attemptTo(
      'add new event to zoom calendar',
      () => Calendar.createEvent(account.calendarID, eventReq),
      () => Zoom.cancelMeeting(String(meeting.id)),
      'the meeting was canceled, please recreate.'
    );
    if (zCalErrResp) return zCalErrResp;
    //const [leaderCalErr, leaderCalEventID] = await createEvent(leaderCal, eventReq);
    //if (leaderCalErr !== null) {
    //  return await handleError({ error: leaderCalErr, attemptingTo: 'add event to leadership calendar' }, async () => {
    //  await Zoom.cancelMeeting(String(meeting.id));
    //});
    //}
    const leaderCalEventID = '';

    const [dbErrResp] = await attemptTo(
      'update meeting in database',
      async () => {
        await DB.removeMeeting(dbEvent.meetingID);
        await DB.storeMeeting(
          {
            zoomAccount: account.email,
            title: meetingReq.topic,
            description: meetingReq.agenda,
            startDate: new Date(firstOccur),
            endDate: addMinutes(new Date(firstOccur), meetingReq.duration),
            meetingID: String(meeting.id),
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
            reccurrence: rrule?.toText() || 'none',
          },
          occurrences
        );
      },
      async () => {
        await Zoom.cancelMeeting(String(meeting.id));
        await Calendar.deleteEvent(account.calendarID, zoomCalEventID!);
      },
      'the meeting was canceled, please recreate.'
    );

    if (dbErrResp) return dbErrResp;

    return { success: true, data: { meetingID: meeting.id, newMeeting: !usingOldAccount } };
  }

  const [restoreErr] = await attemptTo('restore calendar event after finding no free calendars', () =>
    Calendar.restoreEvent(oldAccount.calendarID, dbEvent.calendarEvents.zoomEventID)
  );

  if (restoreErr) return restoreErr;

  console.log('No calendars free');
  return { success: false, error: 'no calendars free', code: 409 };
};
