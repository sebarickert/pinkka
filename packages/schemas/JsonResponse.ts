type SuccessResponse<T> = {
  status: "success";
  data: T;
};

type FailResponse = {
  status: "fail";
  data: Record<string, any>;
};

type ErrorResponse = {
  status: "error";
  message: string;
  code?: string | number;
  data?: any;
};

export type JsonResponse<T = unknown> =
  | SuccessResponse<T>
  | FailResponse
  | ErrorResponse;
