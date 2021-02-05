import serverless from 'serverless-http';
import express from 'express';
import { MeetingsRouter } from './routes';
import { logRequest } from './middleware';

const app = express();

// handle pre-flight requests
app.options('*', (req, res) => {
  res.sendStatus(204); // No Content
});

app.use(express.json());

app.use(logRequest);

app.use('/meetings', MeetingsRouter);

app.all('*', (req, res) => {
  res.sendStatus(404); // Not Found
});

export const api = serverless(app);
