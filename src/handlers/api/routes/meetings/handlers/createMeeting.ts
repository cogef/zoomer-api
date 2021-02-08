import { DateTime } from 'luxon';
import randomString from 'randomstring';
import { User } from '../../../../../utils/auth';
import * as Calendar from '../../../../../utils/calendar';
import * as DB from '../../../../../utils/db';
import { MASTER_ZOOM_CAL_ID, ministries } from '../../../../../utils/general';
import * as Gmail from '../../../../../utils/gmail';
import * as Zoom from '../../../../../utils/zoom';
import { attemptTo, HandlerResponse } from '../../../helpers';

export const createMeeting = async (user: User, meetingReq: Zoom.ZoomerMeetingRequest): Promise<HandlerResponse> => {
  const startDT = meetingReq.start_time;
  const accounts = await DB.getZoomAccounts();

  const hourBefore = DateTime.fromISO(startDT).minus({ hour: 1 }).toUTC().toISO();
  const bufferDuration = meetingReq.duration + 120; // buffer duration includes hour before and after

  const occursRrule = meetingReq.recurrence
    ? Calendar.zoomToRFCRecurrence(meetingReq.recurrence, hourBefore)
    : undefined;

  const [freeErrResp, freeIdx] = await attemptTo('find a free account', () => {
    return Calendar.findFirstFree(hourBefore, bufferDuration, accounts, occursRrule?.toString());
  });

  if (freeErrResp) return freeErrResp;
  const account = accounts[freeIdx!];

  if (account) {
    const [meetingErrResp, _meeting] = await attemptTo('schedule Zoom meeting', () =>
      Zoom.scheduleMeeting(account.email, meetingReq)
    );

    if (meetingErrResp) return meetingErrResp;
    const meeting = _meeting!;

    const [userErrResp, _user] = await attemptTo(
      'get host key',
      () => Zoom.getUser(account.email),
      () => Zoom.cancelMeeting(String(meeting.id))
    );

    if (userErrResp) return userErrResp;
    const zUser = _user!;

    const { host_key: hostKey } = zUser;
    const hostJoinKey = generateKey();

    const eventDesc = [
      `DO NOT MODIFY THIS EVENT`,
      `-------------------------------\n`,
      `${meetingReq.agenda}\n`,
      `-------------------------------`,
      `Scheduled by ${user.email} for ${ministries[meetingReq.ministry]} on ${account.email}`,
      `Meeting ID: ${meeting.id}`,
      `Password: ${meeting.password}`,
      `Host Key: ${hostKey}`,
      `Zoomer Host Join Key: ${hostJoinKey}`,
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
      'add event to zoom calendar',
      () => Calendar.createEvent(account.calendarID, eventReq),
      () => Zoom.cancelMeeting(String(meeting.id))
    );
    if (zCalErrResp) return zCalErrResp;

    const [zMasterCalErrResp, zoomMasterCalEventID] = await attemptTo(
      'add event to master zoom calendar',
      () => Calendar.createEvent(MASTER_ZOOM_CAL_ID, eventReq),
      () => Zoom.cancelMeeting(String(meeting.id))
    );
    if (zMasterCalErrResp) return zMasterCalErrResp;

    const [dbErrResp] = await attemptTo(
      'add meeting to database',
      () =>
        DB.storeMeeting(
          {
            zoomAccount: account.email,
            title: meetingReq.topic,
            description: meetingReq.agenda,
            startDate: firstOccurStart.toJSDate(),
            endDate: firstOccurEnd.toJSDate(),
            meetingID: String(meeting.id),
            hostJoinKey,
            host: {
              name: user.displayName!,
              email: user.email!,
              ministry: meetingReq.ministry,
            },
            calendarEvents: {
              zoomEventID: zoomCalEventID!,
              masterEventID: zoomMasterCalEventID!,
            },
            reccurrence: rrule?.toText() || 'none',
          },
          occurrences
        ),
      async () => {
        await Zoom.cancelMeeting(String(meeting.id));
        await Calendar.deleteEvent(account.calendarID, zoomCalEventID!);
      }
    );

    if (dbErrResp) return dbErrResp;

    const emailBody = await Gmail.renderMeetingCreated({
      agenda: meeting.agenda,
      dialIns: meeting.settings.global_dial_in_numbers,
      host: user.displayName!,
      hostJoinKey,
      joinURL: meeting.join_url,
      meetingID: meeting.id,
      password: meeting.password,
      reccurrence: rrule?.toText(),
      startTime: meeting.start_time,
      topic: meeting.topic,
    });

    const [emailErrResp] = await attemptTo('send confirmation email', () =>
      Gmail.sendEmail(user.email!, `Zoom Meeting Scheduled - ${meeting.topic}`, emailBody)
    );

    if (emailErrResp) return emailErrResp;

    return { success: true, data: { meetingID: meeting.id, hostJoinKey }, code: 201 };
  }

  console.log('No calendars free');
  return { success: false, error: 'no calendars free', code: 409 };
};

const generateKey = () => {
  return randomString.generate({
    length: 4,
    charset: 'numeric',
  });
};
