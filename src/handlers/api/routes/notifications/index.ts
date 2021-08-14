import { Router } from 'express';
import { env } from '../../../../env';
import { HttpStatus } from '../../helpers';

const router = Router();

// Verify Zoom as event originator
router.post('*', (req, res, next) => {
  if (req.headers.authorization !== env.ZOOM_NOTIFICATION_TOKEN) {
    return res.sendStatus(HttpStatus.UNAUTHORIZED);
  }
  next();
});

router.post('/', (req, res) => {
  res.send('hi');
});

router.get('/', (req, res) => {
  res.send('hi');
});

export const NotificationsRouter = router;
