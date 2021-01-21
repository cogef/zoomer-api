import { db } from '../../services/firebase';
import { EventInfo } from './types';

export const storeEvent = (event: EventInfo) => {
  return db.doc(`meetings/${event.meetingID}`).create({
    ...event,
    createdAt: new Date(),
  });
};
