import { getIsUserAdmin } from '../src/handlers/api/routes/users/handlers';

export const adminTest = async () => {
  const res = await getIsUserAdmin('bishoprcnel@cogef.org');
  console.log({ res });
};
