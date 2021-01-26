import { db } from '../../services/firebase';
import { EventInfo, StoredEvent } from './';
import { ZoomAccount } from './types';

export const storeEvent = (event: EventInfo) => {
  return db.doc(`meetings/${event.meetingID}`).create({
    ...event,
    createdAt: new Date(),
  });
};

export const getEvent = async (meetingID: string) => {
  return (await db.doc(`meetings/${meetingID}`).get()).data() as StoredEvent | undefined;
};

export const removeEvent = (meetingID: string) => {
  return db.doc(`meetings/${meetingID}`).delete();
};

/** Returns Zoom accounts in order of sequence */
export const getZoomAccounts = async () => {
  const snap = await db.collection('zoomAccounts').orderBy('sequence').get();
  return snap.docs.map(doc => ({ email: doc.id, ...doc.data() } as ZoomAccount));
};

export const getZoomAccount = async (email: string) => {
  const doc = await db.doc(`zoomAccounts/${email}`).get();
  if (doc.exists) {
    return { email: doc.id, ...doc.data() } as ZoomAccount;
  }
};
