import { addMinutes } from 'date-fns';
import { firestore } from 'firebase-admin';
import { db } from '../../services/firebase';
import { MeetingInfo, StoredMeeting } from './';
import { OccurrenceInfo, StoredOccurrence, ZoomAccount } from './types';

export const storeEvent = async (event: MeetingInfo, occurs: OccurrenceInfo[]) => {
  const batch = db.batch();
  const meetingRef = db.doc(`meetings/${event.meetingID}`);

  const meeting: StoredMeeting = {
    ...event,
    startDate: toTimestamp(event.startDate),
    endDate: toTimestamp(event.endDate),
    createdAt: toTimestamp(new Date()),
  };

  batch.create(meetingRef, meeting);

  occurs.forEach(occur => {
    const startDate = new Date(occur.start_time);
    const endDate = addMinutes(startDate, occur.duration);
    const occRef = meetingRef.collection('occurrences').doc(occur.occurrence_id);

    const occurrence: StoredOccurrence = {
      occurrenceID: occur.occurrence_id,
      startDate: toTimestamp(startDate),
      endDate: toTimestamp(endDate),
      meetingID: event.meetingID,
      hostEmail: event.host.email,
      isSeudo: Boolean(occur.isSeudo),
    };

    batch.create(occRef, occurrence);
  });

  await batch.commit();
};

export const getEvent = async (meetingID: string) => {
  return (await db.doc(`meetings/${meetingID}`).get()).data() as StoredMeeting | undefined;
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

export const getOccurrences = async (hostEmail: string) => {
  const query = db
    .collectionGroup('occurrences')
    .where('hostEmail', '==', hostEmail)
    .where('endDate', '>=', new Date())
    .orderBy('endDate');

  //TODO: Get meeting doc for each meeting to create following result:
  /*
  {
    [meetingID]:{
      ...StoredMeeting,
      occurrences: StoredOccurrence[]
    }
  }
  */
  // Also: limit requests and accept a lastOccurrenceID param

  const occurs = (await query.get()).docs.map(d => d.data() as StoredOccurrence);
  return occurs;
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

const toTimestamp = (date: Date) => firestore.Timestamp.fromDate(date);
