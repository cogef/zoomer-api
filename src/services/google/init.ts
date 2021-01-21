import { google } from 'googleapis';
import { credentials } from '../gcp';

export const initGAPIs = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: credentials.SA_CLIENT_EMAIL,
      private_key: credentials.SA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    // Scopes approved from GSuite Admin Console
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    clientOptions: {
      // Impersonating Zoom Scheduler
      subject: 'scheduler@cogef.org',
    },
  });

  const authClient = await auth.getClient();
  google.options({ auth: authClient });
};

export const calendar = google.calendar('v3');
