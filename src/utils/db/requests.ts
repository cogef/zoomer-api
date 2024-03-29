import { firestore } from 'firebase-admin';
import { DateTime } from 'luxon';
import { db } from '../../services/firebase';
import { MeetingInfo, StoredMeeting } from './';
import { OccurrenceInfo, StoredOccurrence, ZoomAccount, ZoomerMeetingInstance } from './types';

export const storeMeeting = async (event: MeetingInfo, occurs: OccurrenceInfo[]) => {
  const batch = db.batch();
  const meetingRef = db.doc(`meetings/${event.meetingID}`);

  const meeting: StoredMeeting = {
    ...event,
    startDate: toTimestamp(event.startDate.valueOf()),
    endDate: toTimestamp(event.endDate.valueOf()),
    createdAt: toTimestamp(Date.now()),
  };

  batch.create(meetingRef, meeting);

  occurs.forEach((occur, idx) => {
    const startDate = DateTime.fromISO(occur.start_time);
    const endDate = startDate.plus({ minutes: occur.duration });
    const occRef = meetingRef.collection('occurrences').doc(occur.occurrence_id);

    const occurrence: StoredOccurrence = {
      occurrenceID: occur.occurrence_id,
      startDate: toTimestamp(startDate.toMillis()),
      endDate: toTimestamp(endDate.toMillis()),
      meetingID: event.meetingID,
      host: {
        email: event.host.email,
        name: event.host.name,
        ministry: event.host.ministry,
      },
      isSeudo: Boolean(occur.isSeudo),
      sequence: idx + 1,
      totalOccurrences: occurs.length, //TODO: Would rather store this on meeting doc, would require getOccur... refactor
    };

    batch.create(occRef, occurrence);
  });

  await batch.commit();
};

export const getMeeting = async (meetingID: string) => {
  return (await db.doc(`meetings/${meetingID}`).get()).data() as StoredMeeting | undefined;
};

export const removeMeeting = async (meetingID: string) => {
  const meetingRef = db.doc(`meetings/${meetingID}`);
  const occurrencesRef = meetingRef.collection('occurrences');
  const occurDocs = (await occurrencesRef.get()).docs;

  // These batch sizes should usually be limited (~100 docs)
  // for memory concerns and because there's a 500 doc batch limit
  // but Zoom only allows 50 occurrences of a meeting, so the batch
  // size should never exceed 51 (+1 meeting doc)
  const batch = db.batch();

  occurDocs.forEach(doc => {
    batch.delete(doc.ref);
  });

  batch.delete(meetingRef);

  await batch.commit();
};

export const getOccurrences = async (opts: OccursOptions) => {
  let query: firestore.Query = db.collectionGroup('occurrences');

  if (opts.startDate) {
    query = query.where('endDate', '>=', new Date(opts.startDate));
  }

  if (opts.endDate) {
    query = query.where('endDate', '<=', new Date(opts.endDate));
  }

  if (opts.hostEmail) {
    query = query.where('host.email', '==', opts.hostEmail);
  }

  if (opts.startDate || opts.endDate) {
    query = query.orderBy('endDate', opts.dir);
  }

  if (opts.last) {
    const occDoc = await db.doc(`meetings/${opts.last.meetingID}/occurrences/${opts.last.occurrenceID}`).get();
    query = query.startAfter(occDoc);
  }

  query = query.limit(opts.limit);

  const occurs = (await query.get()).docs.map(d => d.data() as StoredOccurrence);
  return occurs;
};

type OccursOptions = {
  hostEmail?: string;
  limit: number;
  startDate: number;
  endDate?: number;
  dir?: 'asc' | 'desc';
  last?: {
    meetingID: string;
    occurrenceID: string;
  };
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

const toTimestamp = (ts: number) => firestore.Timestamp.fromMillis(ts);

export const storeMeetingInstance = async (meeting: ZoomerMeetingInstance) => {
  await db.collection('pastMeetings').doc(encodeUUID(meeting.uuid)).create(meeting);
};

export const storeCloudRecording = async (uuid: string, share_url: string) => {
  await db.collection('pastMeetings').doc(encodeUUID(uuid)).update({ share_url });
};

export const getMeetingInstance = async (uuid: string) => {
  const meetingDoc = await db.collection('pastMeetings').doc(encodeUUID(uuid)).get();
  return meetingDoc.data() as ZoomerMeetingInstance | undefined;
};

/** For Manual Trigger Only */
export const __getAllMeetings = async () => {
  const meetingRefs = await db.collection('meetings').get();
  return meetingRefs.docs.map(doc => doc.data() as StoredMeeting);
};

// Zoom UUIDs may contain '/'s, which are not allowed in Firestore document IDs
const encodeUUID = (uuid: string) => uuid.replace(/\//g, '__');
