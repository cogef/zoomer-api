import { auth } from 'firebase-admin';

declare global {
  namespace Express {
    export interface Request {
      user?: auth.UserRecord;
    }
  }
}
