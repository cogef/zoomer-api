import { User } from '../../../../utils/auth';
import { StoredEvent } from '../../../../utils/db';
import { getUserGroups } from '../../../../utils/directory';

export const isAuthorized = async (event: StoredEvent, user: User) => {
  if (event.host.email === user.email) return true;

  const groups = await getUserGroups(user);
  return groups.includes('zoom.admins@cogef.org');
};
