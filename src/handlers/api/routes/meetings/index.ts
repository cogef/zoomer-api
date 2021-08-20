/// <reference path='../../express.d.ts' />

import { Router } from 'express';
import { handleResponse, HttpStatus } from '../../helpers';
import { authenticate, initializeGAPIs } from '../../middleware';
import { createMeeting, deleteMeeting, getMeeting, getOccurrences } from './handlers';
import { getStartURL } from './handlers/getStartURL';
import { updateMeeting } from './handlers/updateMeeting';

const router = Router();

router.get('/x-status', (req, res) => {
  res.send('active');
});

router.post('/:id/start_url', (req, res) => {
  const { params, body } = req;
  const handler = () => getStartURL(params.id, { hostJoinKey: body.hostJoinKey });
  handleResponse(res, handler);
});

router.use(authenticate);

router.get('/:id/start_url', (req, res) => {
  const { params } = req;
  const handler = () => getStartURL(params.id, { user: req.user! });
  handleResponse(res, handler);
});

router.use(initializeGAPIs);

router.get('/', (req, res) => {
  const { query, user } = req;
  if (query.as === 'occurrences') {
    const hasLast = query.lastMeetingID && query.lastOccurrenceID;
    const opts: Options = {
      hostEmail: query.hostEmail ? String(query.hostEmail) : undefined,
      limit: Number(query.limit),
      startDate: Number(query.start),
      endDate: query.end ? Number(query.end) : undefined,
      dir: query.dir as Options['dir'],
      last: hasLast
        ? {
            meetingID: String(query.lastMeetingID),
            occurrenceID: String(query.lastOccurrenceID),
          }
        : undefined,
    };
    const handler = () => getOccurrences(user!, opts);
    handleResponse(res, handler);
  } else {
    res.sendStatus(HttpStatus.NOT_IMPLEMENTED); // (Get Meetings)
  }
  type Options = Parameters<typeof getOccurrences>[1];
});

router.post('/', (req, res) => {
  const handler = () => createMeeting(req.user!, req.body);
  handleResponse(res, handler);
});

router.get('/:id', (req, res) => {
  const { params } = req;
  const handler = () => getMeeting(req.user!, params.id);
  handleResponse(res, handler);
});

router.put('/:id', (req, res) => {
  const { params, body } = req;
  const handler = () => updateMeeting(req.user!, params.id, body);
  handleResponse(res, handler);
});

router.delete('/:id', (req, res) => {
  const { params } = req;
  const handler = () => deleteMeeting(req.user!, params.id);
  handleResponse(res, handler);
});

export const MeetingsRouter = router;
