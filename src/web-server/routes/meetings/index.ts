import { Router } from 'express';
import { initializeGAPIs } from '../../middleware';
import { createMeeting } from './createMeeting';
import { deleteMeeting } from './deleteMeeting';

const router = Router();

export const MeetingsRouter = router;

router.use(initializeGAPIs);

router.post('/', async (req, res) => {
  try {
    const body = JSON.parse(req.body);
    const result = await createMeeting(body);
    if (result.success) {
      return res.status(result.code || 200).send(result.data);
    }
    res.status(result.code || 400).send({ error: result.error });
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { params } = req;
    const result = await deleteMeeting(params.id);
    if (result.success) {
      return res.status(result.code || 200).send(result.data);
    }
    res.status(result.code || 400).send({ error: result.error });
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.send({ yourReq: id });
});
