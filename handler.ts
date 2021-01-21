import serverless from 'serverless-http';
import express from 'express';
import { MeetingsRouter } from './src/web-server/routes';

const app = express();

app.use(express.json());

app.use('/meetings', MeetingsRouter);

// handle pre-flight requests
app.options('*', (req, res) => {
  res.sendStatus(204); // No Content
});

app.all('*', (req, res) => {
  res.sendStatus(404); // Not Found
});

export const api = serverless(app);
