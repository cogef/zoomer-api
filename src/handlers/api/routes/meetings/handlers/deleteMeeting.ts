import { User } from '../../../../../utils/auth';
import * as Calendar from '../../../../../utils/calendar';
import * as DB from '../../../../../utils/db';
import { MASTER_ZOOM_CAL_ID } from '../../../../../utils/general';
import * as Zoom from '../../../../../utils/zoom';
import { HandlerResponse } from '../../../helpers';
import { isAuthorized } from '../helpers';

export const deleteMeeting = async (user: User, meetingID: string): Promise<HandlerResponse> => {
  const dbMeeting = await DB.getMeeting(meetingID);
  if (!dbMeeting) {
    return { success: false, error: 'meeting not found in db', code: 404 };
  }

  if (!isAuthorized(dbMeeting.host.email, user.email!)) {
    return { success: false, error: 'not authorized to access meeting', code: 401 };
  }

  const zoomAccount = await DB.getZoomAccount(dbMeeting.zoomAccount);
  if (!zoomAccount) {
    return { success: false, error: 'zoom account not found' };
  }

  await Zoom.cancelMeeting(meetingID);
  await Calendar.deleteEvent(zoomAccount.calendarID, dbMeeting.calendarEvents.zoomEventID);
  await Calendar.deleteEvent(MASTER_ZOOM_CAL_ID, dbMeeting.calendarEvents.masterEventID);
  await DB.removeMeeting(meetingID);

  return { success: true, data: {}, code: 204 };
};
