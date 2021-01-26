import admin from 'firebase-admin';
import { credentials } from '../gcp';

admin.initializeApp({
  credential: admin.credential.cert({
    clientEmail: credentials.SA_CLIENT_EMAIL,
    projectId: credentials.SA_PROJECT_ID,
    privateKey: credentials.SA_PRIVATE_KEY,
  }),
});

export const db = admin.firestore();
export const auth = admin.auth();
