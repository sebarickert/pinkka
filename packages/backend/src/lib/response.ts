import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { JsonResponse } from "@pinkka/schemas/JsonResponse.js";

// JSend specification
// https://github.com/omniti-labs/jsend

export function success<T>(
  c: Context,
  data: T,
  status: ContentfulStatusCode = 200
) {
  return c.json<JsonResponse<T>>({ status: "success", data }, status);
}

export function fail(
  c: Context,
  data: Record<string, any>,
  status: ContentfulStatusCode = 400
) {
  return c.json<JsonResponse>({ status: "fail", data }, status);
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
  return c.json<JsonResponse>(
    { status: "error", message, ...(code && { code }), ...(data && { data }) },
    status
  );
}
