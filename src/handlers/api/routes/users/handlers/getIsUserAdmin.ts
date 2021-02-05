import { isAdmin } from '../../../../../utils/directory';
import { attemptTo, HandlerResponse } from '../../../helpers';

export const getIsUserAdmin = async (email: string): Promise<HandlerResponse> => {
  const [adminErr, _isAdmin] = await attemptTo('get admin status', () => isAdmin(email));
  if (adminErr) return adminErr;

  const result = { isAdmin: _isAdmin };
  return { success: true, data: result };
};
