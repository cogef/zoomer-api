import { User } from '../../../../../utils/auth';
import { StoredMeeting } from '../../../../../utils/db';
import { HandlerResponse } from '../../../helpers';
import { isAuthorized } from '../helpers';
import * as DB from '../../../../../utils/db';

export const getOccurrences = async (user: User, hostEmail: string, opts: Options): Promise<HandlerResponse> => {
  if (!isAuthorized(hostEmail, user.email!)) {
    return { success: false, error: 'not authorized', code: 401 };
  }

  const occurrences = await DB.getOccurrences(hostEmail, opts);
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

type Options = {
  last?: {
    meetingID: string;
    occurrenceID: string;
  };
  limit: number;
  startDate: number;
  endDate?: number;
};
