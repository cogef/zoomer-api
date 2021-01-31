import { User } from '../../../../../utils/auth';
import { StoredOccurrence } from '../../../../../utils/db';
import { HandlerResponse } from '../../../helpers';
import { isAuthorized } from '../helpers';
import * as DB from '../../../../../utils/db';

export const getOccurrences = async (user: User, hostEmail: string): Promise<HandlerResponse> => {
  if (!isAuthorized(hostEmail, user.email!)) {
    return { success: false, error: 'not authorized', code: 401 };
  }

  const occurrences = await DB.getOccurrences(hostEmail);
  const result = occurrences.map(occ => ({
    ...occ,
    startDate: occ.startDate.toMillis(),
    endDate: occ.endDate.toMillis(),
  }));

  return { success: true, data: result };
};
