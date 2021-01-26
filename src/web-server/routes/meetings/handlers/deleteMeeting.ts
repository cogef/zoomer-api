import { User } from '../../../../utils/auth';
import * as Calendar from '../../../../utils/calendar';
import * as DB from '../../../../utils/db';
import * as Zoom from '../../../../utils/zoom';
import { HandlerResponse } from '../../../utils';

export const deleteMeeting = async (user: User, meetingID: string): Promise<HandlerResponse> => {
  const dbMeeting = await DB.getEvent(meetingID);
  if (!dbMeeting) {
    return { success: false, error: 'meeting not found in db', code: 404 };
  }

  if (dbMeeting.host.email !== user.email) {
    return { success: false, error: 'not authorized to access meeting', code: 401 };
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
