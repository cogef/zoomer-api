import { getIsUserAdmin } from '../src/handlers/api/routes/users/handlers';
import { initGAPIs } from '../src/services/googleapis';

export const adminTest = async () => {
  await initGAPIs();
  const res = await getIsUserAdmin('bishoprcnel@cogef.org');
  console.log({ res });
};
