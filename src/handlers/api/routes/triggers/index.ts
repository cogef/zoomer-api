import { Router } from 'express';
import { env } from '../../../../env';
import { handleResponse, HttpStatus } from '../../helpers';
import { initializeGAPIs } from '../../middleware';
import { storeAllMeetingInstances } from './handlers';

const router = Router();

router.get('/x-status', (req, res) => {
  res.send('active');
});

router.use((req, res, next) => {
  const token = req.headers.authorization;
  if (token === env.TRIGGER_TOKEN) {
    next();
  } else {
    res.sendStatus(HttpStatus.UNAUTHORIZED);
  }
});

router.get('/x-auth', (req, res) => {
  res.send('You got it!');
});

router.use(initializeGAPIs);

router.post('/store-all-meeting-instances', (req, res) => {
  const handler = () => storeAllMeetingInstances();
  handleResponse(res, handler);
});

export const TriggersRouter = router;
