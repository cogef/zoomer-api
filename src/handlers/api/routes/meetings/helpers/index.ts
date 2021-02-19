import { isAdmin } from '../../../../../utils/directory';

export const isAuthorized = async (hostEmail: string, userEmail: string) => {
  if (hostEmail === userEmail) return true;
  return await isAdmin(userEmail);
};
