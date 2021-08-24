import * as Sentry from '@sentry/serverless';
import express from 'express';
import serverless from 'serverless-http';
import { env } from '../../env';
import { HttpStatus } from './helpers';
import { captureRequestID, dev, logRequest } from './middleware';
import { MeetingsRouter, NotificationsRouter, TriggersRouter, UsersRouter } from './routes';

export const app = express();

// allow local requests while running in development
app.use('*', dev);

// handle pre-flight requests
app.options('*', (req, res) => {
  res.sendStatus(HttpStatus.NO_CONTENT);
});

app.use(captureRequestID);

app.use(express.json());

app.use(logRequest);

app.use('/meetings', MeetingsRouter);

app.use('/users', UsersRouter);

app.use('/notifications', NotificationsRouter);

app.use('/triggers', TriggersRouter);

app.all('*', (req, res) => {
  res.sendStatus(HttpStatus.NOT_FOUND);
});

if (env.NODE_ENV !== 'development') {
  Sentry.AWSLambda.init({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 0.5,
    environment: env.NODE_ENV,
  });
}

export const api = Sentry.AWSLambda.wrapHandler(serverless(app));
