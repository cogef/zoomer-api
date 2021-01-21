export type HandlerResponse =
  | {
      success: true;
      data: any;
    }
  | {
      success: false;
      error: string;
    };
