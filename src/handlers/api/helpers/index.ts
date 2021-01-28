import { Response } from 'express';

export const handleResponse = async (res: Response, handler: () => Promise<HandlerResponse>) => {
  try {
    const result = await handler();
    if (result.success) {
      return res.status(result.code || 200).send(result.data);
    }
    res.status(result.code || 400).send({ error: result.error });
  } catch (err) {
    res.status(500).send({ error: err });
  }
};

export type HandlerResponse =
  | {
      success: true;
      data: Record<any, any>;
      code?: number;
    }
  | {
      success: false;
      error: string;
      code?: number;
    };
