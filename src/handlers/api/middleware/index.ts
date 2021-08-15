import { setUser } from '@sentry/serverless';
import { RequestHandler } from 'express';
import { inspect } from 'util';
import { env } from '../../../env';
import { initGAPIs } from '../../../services/googleapis';
import { getUserFromToken } from '../../../utils/auth';
import { HttpStatus } from '../helpers';

export const initializeGAPIs: RequestHandler = async (req, res, next) => {
  try {
    await initGAPIs();
  } catch (err) {
    console.error(err);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error Initializing Google APIs');
  }
  next();
};

export const authenticate: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization?.replace(/[Bb]earer /, '');
  const user = await getUserFromToken(token);

  if (!user) {
    return res.sendStatus(HttpStatus.UNAUTHORIZED);
  }

  req.user = user;

  setUser({
    id: user.uid,
    username: user.displayName,
    email: user.email,
    ip_address: req.ip,
  });

  next();
};

export const logRequest: RequestHandler = (req, res, next) => {
  console.debug({
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
    body: inspect(req.body, false, 10),
  });
  next();
};

export const dev: RequestHandler = (req, res, next) => {
  if (env.NODE_ENV === 'development') {
    res.setHeader('access-control-allow-origin', '*');
    res.setHeader('access-control-allow-methods', '*');
    res.setHeader('access-control-allow-headers', '*');
  }
  next();
};
