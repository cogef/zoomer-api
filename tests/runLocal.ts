import 'dotenv/config';
import { Server } from 'http';
import { app } from '../src/handlers';

const runLocalServer = async () => {
  const server = new Server(app);
  const PORT = 8000;

  server.listen(PORT, () => {
    console.log(`Zoomer API listening on port ${PORT}`);
  });
};

runLocalServer();
