import { DateTime } from 'luxon';

/** Wrap an operation in a try catch */
export const tryCatch = async <T>(fn: () => Promise<T> | T): Promise<TryResult<T>> => {
  try {
    const res = await fn();
    return [null, res];
  } catch (err) {
    return [err, null];
  }
};
type TryResult<T> = [Error: null, Data: T] | [Error: Error | string, Data: null];

export const stripFracSec = (dt: string) => {
  return dt.replace(/\.\d+/, '');
};

export const toEasternDTString = (dt: string) => {
  return DateTime.fromISO(dt).setZone('America/New_York').toFormat("DDDD 'at' t 'Eastern Time (US and Canada)'");
};
