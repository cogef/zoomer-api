import { RequestHandler } from 'express';
import { initGAPIs } from '../../services/googleapis';

export const initializeGAPIs: RequestHandler = async (req, res, next) => {
  await initGAPIs();
  next();
};
