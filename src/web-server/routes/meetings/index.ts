import { Router } from 'express';
import { getFirebaseUser, initializeGAPIs } from '../../middleware';
import { handleResponse } from '../../utils';
import { createMeeting, deleteMeeting, getMeeting } from './handlers';

const router = Router();

export const MeetingsRouter = router;

router.use(initializeGAPIs);
router.use(getFirebaseUser);

router.get('/:id', async (req, res) => {
  const { params } = req;
  const handler = () => getMeeting(req.user!, params.id);
  handleResponse(res, handler);
});

router.post('/', async (req, res) => {
  const body = JSON.parse(req.body);
  const handler = () => createMeeting(req.user!, body);
  handleResponse(res, handler);
});

router.delete('/:id', async (req, res) => {
  const { params } = req;
  const handler = () => deleteMeeting(req.user!, params.id);
  handleResponse(res, handler);
});
