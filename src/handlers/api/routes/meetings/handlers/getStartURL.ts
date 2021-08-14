import { User } from '../../../../../utils/auth';
import * as DB from '../../../../../utils/db';
import * as Zoom from '../../../../../utils/zoom';
import { HandlerResponse, HttpStatus } from '../../../helpers';
import { isAuthorized } from '../helpers';

export const getStartURL = async (meetingID: string, opts: Options): Promise<HandlerResponse> => {
  const event = await DB.getMeeting(meetingID);
  if (!event) {
    return { success: false, error: 'meeting not found in db', code: HttpStatus.NOT_FOUND };
  }

  if (opts.hostJoinKey !== undefined) {
    if (opts.hostJoinKey !== event.hostJoinKey) {
      return { success: false, error: 'incorrect host join key', code: HttpStatus.UNAUTHORIZED };
    }
  } else {
    if (!isAuthorized(event.host.email, opts.user.email!)) {
      return { success: false, error: 'not authorized', code: HttpStatus.UNAUTHORIZED };
    }
  }

  const meeting = await Zoom.getMeeting(meetingID);

  if (!meeting) {
    return { success: false, error: 'zoom meeting not found', code: HttpStatus.NOT_FOUND };
  }

  const { start_url: startURL } = meeting;

  return { success: true, data: { startURL } };
};

type Options =
  | {
      hostJoinKey: string;
      user?: never;
    }
  | { user: User; hostJoinKey?: never };
