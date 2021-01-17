import { google } from 'googleapis';

export const initGAPIs = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.SA_CLIENT_EMAIL,
      private_key: process.env.SA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    // Scopes approved from GSuite Admin Console
    scopes: [
      //'https://www.googleapis.com/auth/admin.directory.user',
      //'https://www.googleapis.com/auth/admin.directory.user.readonly',
      //'https://www.googleapis.com/auth/admin.directory.group',
      //'https://www.googleapis.com/auth/admin.directory.group.readonly',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
      //'https://www.googleapis.com/auth/cloud-platform',
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
