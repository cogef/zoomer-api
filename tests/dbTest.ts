import { getZoomAccounts } from '../src/utils/db';

export const dbTest = async () => {
  const accounts = await getZoomAccounts();
  console.log({ accounts });
};
