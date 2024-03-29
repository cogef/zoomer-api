import { google } from 'googleapis';
import { env } from '../../env';

export const initGAPIs = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: env.SA_CLIENT_EMAIL,
      private_key: env.SA_PRIVATE_KEY,
    },
    // Scopes approved from GSuite Admin Console > Security > API Controls > DWD
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/admin.directory.group.readonly',
      'https://www.googleapis.com/auth/gmail.send',
    ],
    clientOptions: {
      // Impersonating Zoom Scheduler
      subject: env.CALENDAR_OWNER_EMAIL,
    },
  });

  const authClient = await auth.getClient();
  google.options({ auth: authClient });
};

export const calendar = google.calendar('v3');

export const admin = google.admin('directory_v1');

export const gmail = google.gmail('v1').users;
