import { auth } from '../src/services/firebase';
import { initGAPIs } from '../src/services/googleapis';
import { getUserGroups } from '../src/utils/directory';

export const adminTest = async () => {
  await initGAPIs();
  const user = await auth.getUser('eVgwiI6fgkVxMNXTtYuABmOgt7s2');
  const groups = await getUserGroups(user);
  console.log({ groups });
};
