import 'dotenv/config';

export const env = {
  ARCHIVE_ZOOM_CALENDAR_ID: process.env.ARCHIVE_ZOOM_CALENDAR_ID || '',
  CALENDAR_OWNER_EMAIL: process.env.CALENDAR_OWNER_EMAIL || '',
  FRONTEND_HOST: process.env.FRONTEND_HOST || 'http://localhost:3002',
  MASTER_ZOOM_CALENDAR_ID: process.env.MASTER_ZOOM_CALENDAR_ID || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 8000,
  SA_PROJECT_ID: process.env.SA_PROJECT_ID || '',
  SA_PRIVATE_KEY: (process.env.SA_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  SA_CLIENT_EMAIL: process.env.SA_CLIENT_EMAIL || '',
  SENTRY_DSN: process.env.SENTRY_DSN || '',
  TRIGGER_TOKEN: process.env.TRIGGER_TOKEN || '',
  ZOOM_ACCOUNT_ID: process.env.ZOOM_ACCOUNT_ID || '',
  ZOOM_CLIENT_ID: process.env.ZOOM_CLIENT_ID || '',
  ZOOM_CLIENT_SECRET: process.env.ZOOM_CLIENT_SECRET || '',
  ZOOM_NOTIFICATION_TOKEN: process.env.ZOOM_NOTIFICATION_TOKEN || '',
};
