interface SuccessResponse<T> {
  status: "success";
  data: T;
}

interface FailResponse {
  status: "fail";
  data: Record<string, unknown>;
}

interface ErrorResponse {
  status: "error";
  message: string;
  code?: string | number;
  data?: unknown;
}

export type JsonResponse<T = unknown> =
  | SuccessResponse<T>
  | FailResponse
  | ErrorResponse;
