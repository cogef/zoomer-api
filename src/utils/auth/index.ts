import { auth as Auth } from 'firebase-admin';
import { auth } from '../../services/firebase';

export const getUserFromToken = async (token?: string) => {
  if (!token) return;
  try {
    const decoded = await auth.verifyIdToken(token);
    return await auth.getUser(decoded.uid);
  } catch (err) {
    console.error({ getUserError: err });
    return;
  }
};

export type User = Auth.UserRecord;
