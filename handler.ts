import serverless from 'serverless-http';
import express from 'express';
import { MeetingsRouter } from './src/web-server/routes';
import { logRequest } from './src/web-server/middleware';

const app = express();

app.use(logRequest);

// handle pre-flight requests
app.options('*', (req, res) => {
  res.sendStatus(204); // No Content
});

app.use(express.json());

app.use('/meetings', MeetingsRouter);

app.all('*', (req, res) => {
  res.sendStatus(404); // Not Found
});

export const api = serverless(app);
