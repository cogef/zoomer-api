import 'dotenv/config';
import { Server } from 'http';
import { env } from '../src/env';
import { app } from '../src/handlers';

const runLocalServer = async () => {
  const server = new Server(app);
  const PORT = env.PORT || 8000;

  server.listen(PORT, () => {
    console.log(`Zoomer API listening on port ${PORT}`);
  });
};

runLocalServer();
