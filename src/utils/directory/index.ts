import { admin } from '../../services/googleapis';

export const getUserGroups = async (userEmail: string) => {
  const { data } = await admin.groups.list({
    userKey: userEmail,
  });

  return data.groups!.map(g => g.email!);
};

export const isAdmin = async (email: string) => {
  const groups = await getUserGroups(email);
  return groups.includes('zoom.admins@cogef.org');
};
