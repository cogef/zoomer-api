import { Router } from 'express';
import { handleResponse } from '../../helpers';
import { authenticate } from '../../middleware';
import { getIsUserAdmin } from './handlers';

const router = Router();

router.use(authenticate);

router.get('/:key/isAdmin', (req, res) => {
  const { params, user } = req;
  const keyParam = params.key;
  const email = keyParam === 'self' ? user!.email! : keyParam;

  const handler = () => getIsUserAdmin(email);
  handleResponse(res, handler);
});

export const UsersRouter = router;
