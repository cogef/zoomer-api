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
