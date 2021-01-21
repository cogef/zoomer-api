import { RequestHandler } from 'express';
import { initGAPIs } from '../../services/google';

export const initializeGAPIs: RequestHandler = async (req, res, next) => {
  await initGAPIs();
  next();
};
