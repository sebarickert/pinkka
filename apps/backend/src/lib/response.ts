import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

// JSend specification
// https://github.com/omniti-labs/jsend

export function success(
  c: Context,
  data: unknown,
  status: ContentfulStatusCode = 200,
) {
  return c.json({ status: "success", data }, status);
}

export function fail(
  c: Context,
  data: Record<string, any>,
  status: ContentfulStatusCode = 400,
) {
  return c.json({ status: "fail", data }, status);
}

export function error(
  c: Context,
  message: string,
  options?: {
    code?: string | number;
    status?: ContentfulStatusCode;
    data?: unknown;
  },
) {
  const { code, status = 500, data } = options ?? {};
  return c.json(
    {
      status: "error",
      message,
      ...(code && { code }),
      ...(typeof data === "object" && data !== null ? { data } : {}),
    },
    status,
  );
}
