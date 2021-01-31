import { Response } from 'express';

export const handleResponse = async (res: Response, handler: () => Promise<HandlerResponse>) => {
  try {
    const result = await handler();
    if (result.success) {
      return res.status(result.code || 200).send(result.data);
    }
    res.status(result.code || 400).send({ error: result.error });
    console.info({ CAUGHT_ERROR: result.error });
  } catch (err) {
    const error = err instanceof Error ? err.message : err;
    res.status(500).send({ error });
    console.error({ UNCAUGHT_ERROR: err });
  }
};

export type HandlerResponse = HandlerSuccessResponse | HandlerErrorResponse;

export type HandlerSuccessResponse = {
  success: true;
  data: Record<any, any>;
  code?: number;
};

export type HandlerErrorResponse = {
  success: false;
  error: string;
  code?: number;
};
