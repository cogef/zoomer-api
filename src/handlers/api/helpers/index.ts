import { Response } from 'express';
import { tryCatch } from '../../../utils/general';

export const handleResponse = async (res: Response, handler: () => Promise<HandlerResponse>) => {
  try {
    const result = await handler();
    if (result.success) {
      return res.status(result.code || 200).send(result.data);
    }

    const error = result.error instanceof Error ? result.error.message : result.error;
    res.status(result.code || 400).send({ error: result.context || error });

    if (result.code && result.code >= 500) {
      console.error({ CAUGHT_ERROR: result });
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : err;
    res.status(500).send({ error });
    console.error({ UNCAUGHT_ERROR: err });
  }
};

/** Attempts an operation, `op`
 *
 * If successful => returns data from operation
 *
 * Else runs `cleanup` and returns a handler error
 */
export const attemptTo = async <T>(
  attemptingTo: string,
  op: () => Promise<T> | T,
  cleanup?: () => any
): Promise<AttemptResult<T>> => {
  const res = await tryCatch(op);

  if (res[0] !== null) {
    if (cleanup) await cleanup();

    return [
      {
        success: false,
        error: res[0],
        context: `An error occurred while attempting to ${attemptingTo}`,
        code: 500,
      },
      null,
    ];
  }

  return [null, res[1]];
};

type AttemptResult<T> = [ErrResp: HandlerErrorResponse, Data: null] | [ErrResp: null, Data: T];

export type HandlerResponse = HandlerSuccessResponse | HandlerErrorResponse;

export type HandlerSuccessResponse = {
  success: true;
  data: Record<any, any>;
  code?: number;
};

export type HandlerErrorResponse = {
  success: false;
  error: Error | string;
  context?: string;
  code?: number;
};
