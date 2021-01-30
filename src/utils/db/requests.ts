import { addMinutes } from 'date-fns';
import { db } from '../../services/firebase';
import { EventInfo, StoredEvent } from './';
import { OccurrenceInfo, StoredOccurrence, ZoomAccount } from './types';

export const storeEvent = async (event: EventInfo, occurs: OccurrenceInfo[]) => {
  const batch = db.batch();
  const meetingRef = db.doc(`meetings/${event.meetingID}`);

  batch.create(meetingRef, {
    ...event,
    createdAt: new Date(),
  });

  occurs.forEach(occur => {
    const startDate = new Date(occur.start_time);
    const endDate = addMinutes(startDate, occur.duration);
    const occRef = meetingRef.collection('occurrences').doc(occur.occurrence_id);

    batch.create(occRef, {
      occurrenceID: occur.occurrence_id,
      startDate,
      endDate,
      status: occur.status,
      meetingID: event.meetingID,
      host_email: event.host.email,
      isSeudo: Boolean(occur.isSeudo),
    } as StoredOccurrence);
  });

  await batch.commit();
};

export const getEvent = async (meetingID: string) => {
  return (await db.doc(`meetings/${meetingID}`).get()).data() as StoredEvent | undefined;
};

export const removeEvent = async (meetingID: string) => {
  const meetingRef = db.doc(`meetings/${meetingID}`);
  const occurrencesRef = meetingRef.collection('occurrences');
  const occurDocs = (await occurrencesRef.get()).docs;

  const batch = db.batch();

  occurDocs.forEach(doc => {
    batch.delete(doc.ref);
  });

  batch.delete(meetingRef);

  await batch.commit();
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
