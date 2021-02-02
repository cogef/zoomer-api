import { User } from '../../../../../utils/auth';
import * as DB from '../../../../../utils/db';
import * as Zoom from '../../../../../utils/zoom';
import { HandlerResponse } from '../../../helpers';
import { isAuthorized } from '../helpers';

export const getMeeting = async (user: User, meetingID: string): Promise<HandlerResponse> => {
  const event = await DB.getMeeting(meetingID);
  if (!event) {
    return { success: false, error: 'meeting not found in db', code: 404 };
  }

  if (!isAuthorized(event.host.email, user.email!)) {
    return { success: false, error: 'not authorized to access meeting', code: 401 };
  }

  const meeting = await Zoom.getMeeting(meetingID);

  if (!meeting) {
    return { success: false, error: 'meeting not found', code: 404 };
  }

  const isReccurring = Boolean(meeting.recurrence);
  const startTime = meeting.occurrences![0].start_time;

  const zoomerMeeting: Zoom.ZoomerMeeting = {
    ...meeting,
    start_time: isReccurring ? startTime : meeting.start_time,
    ministry: event.host.ministry,
  };

  return { success: true, data: zoomerMeeting };
};
