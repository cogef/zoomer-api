/// <reference path='../../express.d.ts' />

import { Router } from 'express';
import { validateUser, initializeGAPIs } from '../../middleware';
import { handleResponse } from '../../helpers';
import { createMeeting, deleteMeeting, getMeeting, getOccurrences } from './handlers';
import { getStartURL } from './handlers/getStartURL';
import { updateMeeting } from './handlers/updateMeeting';

const router = Router();

router.post('/:id/start_url', (req, res) => {
  const { params, body } = req;
  const handler = () => getStartURL(params.id, { hostJoinKey: body.hostJoinKey });
  handleResponse(res, handler);
});

router.use(validateUser);

router.get('/:id/start_url', (req, res) => {
  const { params } = req;
  const handler = () => getStartURL(params.id, { user: req.user! });
  handleResponse(res, handler);
});

router.use(initializeGAPIs);

router.get('/', (req, res) => {
  const { query, user } = req;
  const { as, ...rest } = query;
  if (as === 'occurrences') {
    const hasLast = rest.lastMeetingID && rest.lastOccurrenceID;
    const opts = {
      limit: Number(rest.limit),
      startDate: Number(rest.start),
      end: rest.end ? Number(rest.end) : undefined,
      last: hasLast
        ? {
            meetingID: String(rest.lastMeetingID),
            occurrenceID: String(rest.lastOccurrenceID),
          }
        : undefined,
    };
    const handler = () => getOccurrences(req.user!, user!.email!, opts);
    handleResponse(res, handler);
  } else {
    res.sendStatus(501); // Not Implemented (Get Meetings)
  }
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
