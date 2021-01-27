import { google } from 'googleapis';
import { credentials } from '../gcp';

export const initGAPIs = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: credentials.SA_CLIENT_EMAIL,
      private_key: credentials.SA_PRIVATE_KEY,
    },
    // Scopes approved from GSuite Admin Console > Security > API Controls > DWD
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/admin.directory.group.readonly',
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

export const admin = google.admin('directory_v1');
