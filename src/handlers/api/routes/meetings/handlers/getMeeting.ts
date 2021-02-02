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

  // Zoom doesn't supply start time nor duration for reccurring meetings
  const firstOccur = meeting.occurrences?.[0];
  const startTime = firstOccur?.start_time;
  const duration = firstOccur?.duration;

  const zoomerMeeting: Zoom.ZoomerMeeting = {
    ...meeting,
    start_time: startTime ? startTime : meeting.start_time,
    duration: duration ? duration : meeting.duration,
    ministry: event.host.ministry,
  };

  return { success: true, data: zoomerMeeting };
};
