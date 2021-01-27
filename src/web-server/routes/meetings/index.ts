import { Router } from 'express';
import { validateUser, initializeGAPIs } from '../../middleware';
import { handleResponse } from '../../utils';
import { createMeeting, deleteMeeting, getMeeting } from './handlers';
import { getStartURL } from './handlers/getStartURL';

const router = Router();

export const MeetingsRouter = router;

router.post('/:id/start_url', (req, res) => {
  const { params } = req;
  const handler = () => getStartURL(params.id, req.body.hostJoinKey);
  handleResponse(res, handler);
});

router.use(validateUser);
router.use(initializeGAPIs);

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
