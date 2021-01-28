import { User } from '../../../../../utils/auth';
import * as DB from '../../../../../utils/db';
import * as Zoom from '../../../../../utils/zoom';
import { HandlerResponse } from '../../../helpers';
import { isAuthorized } from '../helpers';

export const getMeeting = async (user: User, meetingID: string): Promise<HandlerResponse> => {
  const event = await DB.getEvent(meetingID);
  if (!event) {
    return { success: false, error: 'meeting not found in db', code: 404 };
  }

  const meeting = await Zoom.getMeeting(meetingID);

  if (!meeting) {
    return { success: false, error: 'meeting not found', code: 404 };
  }

  if (!isAuthorized(event, user)) {
    return { success: false, error: 'not authorized to access meeting', code: 401 };
  }

  const zoomerMeeting: Zoom.ZoomerMeeting = {
    ...meeting,
    ministry: event.host.ministry,
  };

  return { success: true, data: zoomerMeeting };
};
