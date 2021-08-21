import { env } from '../../../../../env';
import * as Calendar from '../../../../../utils/calendar';
import * as DB from '../../../../../utils/db';
import { ministries } from '../../../../../utils/general';
import * as Zoom from '../../../../../utils/zoom';
import { attemptTo, HandlerResponse, HttpStatus } from '../../../helpers';

export const storeMeetingInstance = async (
  meetingUUID: string,
  __dbMeeting?: DB.StoredMeeting
): Promise<HandlerResponse> => {
  const [meetingErr, meeting] = await attemptTo('get ended meeting', () => Zoom.getPastMeeting(meetingUUID));
  if (meetingErr) {
    return meetingErr;
  }

  if (!meeting) {
    return { success: false, error: 'Meeting not found by Zoom', code: HttpStatus.INTERNAL_SERVER_ERROR };
  }

  let tmpDbMeeting: DB.StoredMeeting;

  if (!__dbMeeting) {
    const [dbMeetingErr, dbMeeting] = await attemptTo('get meeting from db', () => DB.getMeeting(String(meeting.id)));
    if (dbMeetingErr) {
      return dbMeetingErr;
    }

    if (!dbMeeting) {
      return { success: false, error: 'Meeting not found in Database', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    tmpDbMeeting = dbMeeting;
  } else {
    tmpDbMeeting = __dbMeeting;
  }

  const dbMeeting = tmpDbMeeting;

  const eventDesc = [
    `DO NOT MODIFY THIS EVENT`,
    `-------------------------------\n`,
    `${dbMeeting.description}\n`,
    `-------------------------------`,
    `Meeting ID: ${meeting.id}`,
    `Participants: ${meeting.participants_count} (includes reconnects)`,
    `Scheduled by ${dbMeeting.host.name} for ${ministries[dbMeeting.host.ministry]} on ${dbMeeting.zoomAccount}`,
  ].join('\n');

  const [createEventErr, eventID] = await attemptTo('create event on archive calendar', () =>
    Calendar.createEvent(env.ARCHIVE_ZOOM_CALENDAR_ID, {
      title: meeting.topic,
      description: eventDesc,
      start: meeting.start_time,
      end: meeting.end_time,
    })
  );

  const zoomerMeetingInstance: DB.ZoomerMeetingInstance = {
    ...meeting,
    description: dbMeeting.description,
    host: dbMeeting.host,
    zoomAccount: dbMeeting.zoomAccount,
    start_time: new Date(meeting.start_time),
    end_time: new Date(meeting.end_time),
    calendarEventId: eventID || '',
  };

  const [zMeetingErr] = await attemptTo('store meeting instance', () => DB.storeMeetingInstance(zoomerMeetingInstance));

  if (zMeetingErr) {
    return zMeetingErr;
  }

  // Still want to store meeting instance even if there was a calendar error
  if (createEventErr) {
    return createEventErr;
  }

  return { success: true, data: {}, code: HttpStatus.NO_CONTENT };
};
