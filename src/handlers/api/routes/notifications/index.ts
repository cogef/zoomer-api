import { Router } from 'express';
import { env } from '../../../../env';
import { ZoomEvent } from '../../../../utils/zoom';
import { handleResponse, HttpStatus } from '../../helpers';
import { initializeGAPIs } from '../../middleware';
import { storeMeetingInstance } from './handlers';
import { storeCloudRecording } from './handlers/storeCloudRecording';

const router = Router();

router.get('/x-status', (req, res) => {
  res.send('active');
});

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
  switch (event.event) {
    case 'meeting.ended': {
      const handler = () => storeMeetingInstance(event.payload.object.uuid);
      handleResponse(res, handler);
      break;
    }
    case 'recording.completed': {
      const handler = () => storeCloudRecording(event.payload.object.uuid, event.payload.object.share_url);
      handleResponse(res, handler);
      break;
    }
    default: {
      res.sendStatus(HttpStatus.NOT_IMPLEMENTED);
    }
  }
});

export const NotificationsRouter = router;
