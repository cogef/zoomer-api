import 'dotenv/config';

export const env = {
  NODE_ENV: process.env.NODE_ENV!,
  PORT: process.env.PORT,
  SA_PROJECT_ID: process.env.SA_PROJECT_ID!,
  SA_PRIVATE_KEY: process.env.SA_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  SA_CLIENT_EMAIL: process.env.SA_CLIENT_EMAIL!,
  SENTRY_DSN: process.env.SENTRY_DSN!,
  ZOOM_API_KEY: process.env.ZOOM_API_KEY!,
  ZOOM_API_SECRET: process.env.ZOOM_API_SECRET!,
  ZOOM_NOTIFICATION_TOKEN: process.env.ZOOM_NOTIFICATION_TOKEN!,
};
