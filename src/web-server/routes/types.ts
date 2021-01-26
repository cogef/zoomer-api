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
