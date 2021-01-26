import * as Calendar from '../../../utils/calendar';
import * as DB from '../../../utils/db';
import * as Zoom from '../../../utils/zoom';
import { HandlerResponse } from '../types';

export const deleteMeeting = async (meetingID: string): Promise<HandlerResponse> => {
  const dbMeeting = await DB.getEvent(meetingID);
  if (!dbMeeting) {
    return { success: false, error: 'meeting not found', code: 404 };
  }

  const zoomAccount = await DB.getZoomAccount(dbMeeting.zoomAccount);
  if (!zoomAccount) {
    return { success: false, error: 'zoom account not found' };
  }

  await Zoom.cancelMeeting(meetingID);
  await Calendar.deleteEvent(zoomAccount.calendarID, dbMeeting.calendarEvents.zoomEventID);
  //await Calendar.deleteEvent(zoomAccount.calendarID, dbMeeting.calendarEvents.leadershipEventID);
  await DB.removeEvent(meetingID);

  return { success: true, data: {}, code: 204 };
};
