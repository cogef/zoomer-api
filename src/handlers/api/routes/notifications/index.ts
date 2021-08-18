import { Router } from 'express';
import { env } from '../../../../env';
import { ZoomEvent } from '../../../../utils/zoom';
import { handleResponse, HttpStatus } from '../../helpers';
import { initializeGAPIs } from '../../middleware';
import { storeMeetingInstance } from './handlers';

const router = Router();

// Verify Zoom as event originator
router.post('*', (req, res, next) => {
  if (req.headers.authorization !== env.ZOOM_NOTIFICATION_TOKEN) {
    return res.sendStatus(HttpStatus.UNAUTHORIZED);
  }
  next();
});

router.use(initializeGAPIs);

router.post('/', (req, res) => {
  const event: ZoomEvent = req.body;
  if (event.event === 'meeting.ended') {
    const handler = () => storeMeetingInstance(event.payload.object.uuid);
    handleResponse(res, handler);
  }
});

router.get('/', (req, res) => {
  res.send('hi');
});

export const NotificationsRouter = router;
