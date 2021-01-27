import { admin } from '../../services/googleapis';
import { User } from '../auth';

export const getUserGroups = async (user: User) => {
  const { data } = await admin.groups.list({
    userKey: user.email,
  });

  return data.groups!.map(g => g.email!);
};
