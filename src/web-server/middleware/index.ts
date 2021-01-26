import { RequestHandler } from 'express';
import { auth } from '../../services/firebase';
import { initGAPIs } from '../../services/googleapis';

export const initializeGAPIs: RequestHandler = async (req, res, next) => {
  await initGAPIs();
  next();
};

export const getFirebaseUser: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.sendStatus(401);
  }

  const decoded = await auth.verifyIdToken(token);
  req.user = await auth.getUser(decoded.uid);
  next();
};
