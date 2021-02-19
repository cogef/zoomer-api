import 'dotenv/config';
import { Server } from 'http';
import { app } from '../src/handlers';
import { initGAPIs } from '../src/services/googleapis';

const runLocalServer = async () => {
  await initGAPIs();
  const server = new Server(app);
  const PORT = 8000;

  server.listen(PORT, () => {
    console.log(`Zoomer API listening on port ${PORT}`);
  });
};

runLocalServer();
