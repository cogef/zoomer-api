import { captureException } from '@sentry/serverless';
import { Response } from 'express';
import { inspect } from 'util';
import { tryCatch } from '../../../utils/general';
import { HttpStatus } from './http';

export const handleResponse = async (res: Response, handler: () => Promise<HandlerResponse>) => {
  try {
    const result = await handler();
    if (result.success) {
      return res.status(result.code || HttpStatus.OK).send(result.data);
    }

    const error = result.error instanceof Error ? result.error.message : result.error;
    res.status(result.code || HttpStatus.BAD_REQUEST).send({ error, errorMessage: result.context });

    if (result.code && result.code >= 500) {
      console.error(inspect({ CAUGHT_ERROR: result }, false, Infinity));
      captureException(result.error);
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : err;
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error, errorMessage: 'An unexpected server error occurred' });
    console.error(inspect({ UNCAUGHT_ERROR: err }, false, Infinity));
    captureException(err);
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
  cleanup?: () => any,
  failResult?: string
): Promise<AttemptResult<T>> => {
  console.debug(`Attempting to ${attemptingTo}`);
  const res = await tryCatch(op);

  if (res[0] !== null) {
    if (cleanup) await cleanup();

    const errorClause = `An error occurred while attempting to ${attemptingTo}.`;
    const resultClause = failResult ? `As a result of the failed operation, ${failResult}.` : '';

    return [
      {
        success: false,
        error: res[0],
        context: `${errorClause}\n${resultClause}`,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
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
