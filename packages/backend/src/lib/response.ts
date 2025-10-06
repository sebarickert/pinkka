import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

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

// JSend specification
// https://github.com/omniti-labs/jsend

export function success<T>(
  c: Context,
  data: T,
  status: ContentfulStatusCode = 200
) {
  return c.json<SuccessResponse<T>>({ status: "success", data }, status);
}

export function fail(
  c: Context,
  data: Record<string, any>,
  status: ContentfulStatusCode = 400
) {
  return c.json<FailResponse>({ status: "fail", data }, status);
}

export function error(
  c: Context,
  message: string,
  options?: {
    code?: string | number;
    status?: ContentfulStatusCode;
    data?: any;
  }
) {
  const { code, status = 500, data } = options ?? {};
  return c.json<ErrorResponse>(
    { status: "error", message, ...(code && { code }), ...(data && { data }) },
    status
  );
}
