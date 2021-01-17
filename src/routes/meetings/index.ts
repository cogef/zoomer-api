import { Router } from 'express';

const router = Router();

router.get('/:id', (req, res) => {
  res.send({ req: "you've requeted a meeting" });
});

router.post('/', (req, res) => {
  const { body } = req;
  res.send({ yourBody: JSON.parse(body) });
});

export default router;
