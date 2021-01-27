import { RequestHandler } from 'express';
import { initGAPIs } from '../../services/googleapis';
import { getUserFromToken } from '../../utils/auth';

export const initializeGAPIs: RequestHandler = async (req, res, next) => {
  await initGAPIs();
  next();
};

export const validateUser: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization?.replace(/[Bb]earer /, '');
  const user = await getUserFromToken(token);

  if (!user) {
    return res.sendStatus(401);
  }

  req.user = user;
  next();
};

export const logRequest: RequestHandler = (req, res, next) => {
  console.debug({
    path: req.path,
    method: req.method,
  });
  next();
};
