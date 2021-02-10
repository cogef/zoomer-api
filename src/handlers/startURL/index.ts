import serverless from 'serverless-http';
import express from 'express';
//import { MeetingsRouter, UsersRouter } from './routes';

const app = express();

// handle pre-flight requests
app.options('*', (req, res) => {
  res.sendStatus(204); // No Content
});

//app.use(logRequest);

app.all('*', (req, res) => {
  res.sendStatus(404); // Not Found
});

export const api = serverless(app);
