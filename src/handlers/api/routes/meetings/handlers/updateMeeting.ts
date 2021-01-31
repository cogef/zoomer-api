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
  const dbEvent = await DB.getMeeting(meetingID);
  if (!dbEvent) {
    return { success: false, error: 'meeting not found in db', code: 404 };
  }

  if (!isAuthorized(dbEvent.host.email, user.email!)) {
    return { success: false, error: 'not authorized to access meeting', code: 401 };
  }

  const zoomAcc = await DB.getZoomAccount(dbEvent.zoomAccount);

  //TODO: Change create logic to update logic

  console.log('No calendars free');
  return { success: false, error: 'no calendars free' };
};
