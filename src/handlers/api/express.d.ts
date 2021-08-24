import { auth } from 'firebase-admin';

declare global {
  namespace Express {
    export interface Request {
      user?: auth.UserRecord;
    }
  }
}

declare module 'http' {
  interface IncomingHttpHeaders {
    'x-request-id'?: number;
  }
}
