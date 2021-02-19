import { RequestHandler } from 'express';
import { initGAPIs } from '../../../services/googleapis';
import { getUserFromToken } from '../../../utils/auth';

export const initializeGAPIs: RequestHandler = async (req, res, next) => {
  await initGAPIs();
  next();
};

export const authenticate: RequestHandler = async (req, res, next) => {
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
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
  });
  next();
};

export const dev: RequestHandler = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('access-control-allow-origin', '*');
    res.setHeader('access-control-allow-methods', '*');
    res.setHeader('access-control-allow-headers', '*');
  }
  next();
};
