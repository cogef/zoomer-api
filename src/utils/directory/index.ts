import { admin } from '../../services/googleapis';
import { User } from '../auth';

export const getUserGroups = async (userEmail: string) => {
  const { data } = await admin.groups.list({
    userKey: userEmail,
  });

  return data.groups!.map(g => g.email!);
};
