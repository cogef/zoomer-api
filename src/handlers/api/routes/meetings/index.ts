/// <reference path='../../express.d.ts' />

import { Router } from 'express';
import { validateUser, initializeGAPIs } from '../../middleware';
import { handleResponse } from '../../helpers';
import { createMeeting, deleteMeeting, getMeeting, getOccurrences } from './handlers';
import { getStartURL } from './handlers/getStartURL';

const router = Router();

router.post('/:id/start_url', (req, res) => {
  const { params } = req;
  const handler = () => getStartURL(params.id, { hostJoinKey: params.hostJoinKey });
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
  const { params } = req;
  if (params.asOccurrences) {
    const handler = () => getOccurrences(req.user!, params.hostEmail);
    handleResponse(res, handler);
  } else {
    res.sendStatus(501); // Not Implemented (Get Meetings)
  }
});

router.get('/:id', (req, res) => {
  const { params } = req;
  const handler = () => getMeeting(req.user!, params.id);
  handleResponse(res, handler);
});

router.post('/', (req, res) => {
  const handler = () => createMeeting(req.user!, req.body);
  handleResponse(res, handler);
});

router.delete('/:id', (req, res) => {
  const { params } = req;
  const handler = () => deleteMeeting(req.user!, params.id);
  handleResponse(res, handler);
});

export const MeetingsRouter = router;
