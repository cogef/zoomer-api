import { User } from '../../../../../utils/auth';
import * as DB from '../../../../../utils/db';
import { StoredMeeting } from '../../../../../utils/db';
import { isAdmin } from '../../../../../utils/directory';
import { HandlerResponse, HttpStatus } from '../../../helpers';
import { isAuthorized } from '../helpers';

export const getOccurrences = async (user: User, opts: Options): Promise<HandlerResponse> => {
  if (!opts.hostEmail) {
    if (!isAdmin(user.email!)) {
      return { success: false, error: 'not authorized', code: HttpStatus.UNAUTHORIZED };
    }
  } else if (!isAuthorized(opts.hostEmail, user.email!)) {
    return { success: false, error: 'not authorized', code: HttpStatus.UNAUTHORIZED };
  }

  const occurrences = await DB.getOccurrences(opts);
  const meetingIDs = occurrences.reduce((acc, occ) => {
    acc.add(occ.meetingID);
    return acc;
  }, new Set<string>());

  const meetings = [...meetingIDs].reduce((acc, id) => {
    acc[id] = DB.getMeeting(id);
    return acc;
  }, {} as Record<string, Promise<StoredMeeting | undefined>>);

  const result = [];

  for (let occ of occurrences) {
    result.push({
      ...occ,
      startDate: occ.startDate.toMillis(),
      endDate: occ.endDate.toMillis(),
      title: (await meetings[occ.meetingID])!.title,
    });
  }

  return { success: true, data: result };
};

type Options = Parameters<typeof DB.getOccurrences>[0];
