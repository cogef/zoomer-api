import { getUserGroups } from '../../../../../utils/directory';

export const isAuthorized = async (hostEmail: string, userEmail: string) => {
  if (hostEmail === userEmail) return true;

  const groups = await getUserGroups(userEmail);
  return groups.includes('zoom.admins@cogef.org');
};
