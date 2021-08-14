import { User } from '../../../../../utils/auth';
import * as DB from '../../../../../utils/db';
import * as Zoom from '../../../../../utils/zoom';
import { HandlerResponse, HttpStatus } from '../../../helpers';
import { isAuthorized } from '../helpers';

export const getMeeting = async (user: User, meetingID: string): Promise<HandlerResponse> => {
  const dbMeeting = await DB.getMeeting(meetingID);
  if (!dbMeeting) {
    return { success: false, error: 'meeting not found in db', code: HttpStatus.NOT_FOUND };
  }

  if (!isAuthorized(dbMeeting.host.email, user.email!)) {
    return { success: false, error: 'not authorized to access meeting', code: HttpStatus.UNAUTHORIZED };
  }

  const meeting = await Zoom.getMeeting(meetingID);

  if (!meeting) {
    return { success: false, error: 'meeting not found', code: HttpStatus.NOT_FOUND };
  }

  // Zoom doesn't supply start time nor duration for reccurring meetings
  const firstOccur = meeting.occurrences?.[0];
  const startTime = firstOccur?.start_time;
  const duration = firstOccur?.duration;

  const zoomerMeeting: Zoom.ZoomerMeeting = {
    ...meeting,
    start_time: startTime ? startTime : meeting.start_time,
    duration: duration ? duration : meeting.duration,
    ministry: dbMeeting.host.ministry,
    share_url: (await Zoom.getMeetingRecordings(meetingID))?.share_url,
  };

  return { success: true, data: zoomerMeeting };
};
