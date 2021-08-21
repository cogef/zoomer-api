import { DateTime } from 'luxon';
import { User } from '../../../../../utils/auth';
import * as Calendar from '../../../../../utils/calendar';
import * as DB from '../../../../../utils/db';
import { MASTER_ZOOM_CAL_ID, ministries } from '../../../../../utils/general';
import * as Gmail from '../../../../../utils/gmail';
import * as Zoom from '../../../../../utils/zoom';
import { attemptTo, HandlerResponse, HttpStatus } from '../../../helpers';
import { isAuthorized } from '../helpers';

export const updateMeeting = async (
  user: User,
  meetingID: string,
  meetingReq: Zoom.ZoomerMeetingRequest
): Promise<HandlerResponse> => {
  const dbMeeting = await DB.getMeeting(meetingID);
  if (!dbMeeting) {
    return { success: false, error: 'meeting not found in db', code: HttpStatus.NOT_FOUND };
  }

  if (!isAuthorized(dbMeeting.host.email, user.email!)) {
    return { success: false, error: 'not authorized to access meeting', code: HttpStatus.UNAUTHORIZED };
  }

  const startDT = meetingReq.start_time;
  const accounts = await DB.getZoomAccounts();

  const hourBefore = DateTime.fromISO(startDT).minus({ hour: 1 }).toUTC().toISO();
  const bufferDuration = meetingReq.duration + 120; // buffer duration includes hour before and after

  const occursRrule = meetingReq.recurrence
    ? Calendar.zoomToRFCRecurrence(meetingReq.recurrence, hourBefore)
    : undefined;

  const oldAccount = accounts.find(acc => acc.email === dbMeeting.zoomAccount);
  if (!oldAccount) {
    return {
      success: false,
      error: 'Could not find the Zoom account this meeting was scheduled with.\nPlease contact webadmins@cogef.org',
      code: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }

  const [delCalErr] = await attemptTo('remove old calendar event', () =>
    Calendar.deleteEvent(oldAccount.calendarID, dbMeeting.calendarEvents.zoomEventID)
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
    const hostJoinKey = dbMeeting.hostJoinKey;

    const eventDesc = [
      `DO NOT MODIFY THIS EVENT`,
      `-------------------------------\n`,
      `${meetingReq.agenda}\n`,
      `-------------------------------`,
      `Meeting ID: ${meeting.id}`,
      `Password: ${meeting.password}`,
      `Host Key: ${hostKey}`,
      `Zoomer Host Join Key: ${hostJoinKey}`,
      `Scheduled by ${dbMeeting.host.name} for ${ministries[meetingReq.ministry]} on ${account.email}`,
    ].join('\n');

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

    console.log({ occurrences, meeting });

    // actual start time might not fall into reccurrence
    const firstOccurStart = DateTime.fromISO(occurrences[0].start_time);
    const firstOccurEnd = firstOccurStart.plus({ minutes: meetingReq.duration });
    const eventReq = {
      title: meetingReq.topic,
      description: eventDesc,
      start: firstOccurStart.toUTC().toISO(),
      end: firstOccurEnd.toUTC().toISO(),
      recurrence: rrule?.toString(),
    };

    const [zCalErrResp, zoomCalEventID] = await attemptTo(
      'add new event to zoom calendar',
      () => Calendar.createEvent(account.calendarID, eventReq),
      () => Zoom.cancelMeeting(String(meeting.id)),
      'the meeting was canceled, please recreate.'
    );
    if (zCalErrResp) return zCalErrResp;

    const [zMasterCalErrResp, zoomMasterCalEventID] = await attemptTo(
      'update event in master zoom calendar',
      async () => Calendar.updateEvent(MASTER_ZOOM_CAL_ID, dbMeeting.calendarEvents.masterEventID, eventReq),
      () => Zoom.cancelMeeting(String(meeting.id)),
      'the meeting was canceled, please recreate.'
    );
    if (zMasterCalErrResp) return zMasterCalErrResp;

    const [dbErrResp] = await attemptTo(
      'update meeting in database',
      async () => {
        await DB.removeMeeting(dbMeeting.meetingID);
        await DB.storeMeeting(
          {
            zoomAccount: account.email,
            title: meetingReq.topic,
            description: meetingReq.agenda,
            startDate: firstOccurStart.toJSDate(),
            endDate: firstOccurEnd.toJSDate(),
            meetingID: String(meeting.id),
            hostJoinKey,
            host: {
              ...dbMeeting.host,
              ministry: meetingReq.ministry,
            },
            calendarEvents: {
              zoomEventID: zoomCalEventID!,
              masterEventID: zoomMasterCalEventID!,
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

    const emailBody = await Gmail.renderMeetingCreated({
      agenda: meeting.agenda,
      dialIns: meeting.settings.global_dial_in_numbers,
      host: dbMeeting.host.name,
      hostJoinKey,
      joinURL: meeting.join_url,
      meetingID: meeting.id,
      password: meeting.password,
      reccurrence: rrule?.toText(),
      startTime: occurrences[0].start_time,
      topic: meeting.topic,
    });

    const [emailErrResp] = await attemptTo('send confirmation email', () =>
      Gmail.sendEmail(dbMeeting.host.email, `Zoom Meeting Updated - ${meeting.topic}`, emailBody)
    );

    if (emailErrResp) return emailErrResp;

    return { success: true, data: { meetingID: meeting.id, newMeeting: !usingOldAccount } };
  }

  const [restoreErr] = await attemptTo('restore calendar event after finding no free calendars', () =>
    Calendar.restoreEvent(oldAccount.calendarID, dbMeeting.calendarEvents.zoomEventID)
  );

  if (restoreErr) return restoreErr;

  console.log('No calendars free');
  return { success: false, error: 'no calendars free', code: HttpStatus.CONFLICT };
};
