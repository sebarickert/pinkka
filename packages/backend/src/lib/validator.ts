import { error, fail } from "@/lib/response.js";
import { zValidator } from "@hono/zod-validator";
import { validator } from "hono/validator";
import { validate } from "uuid";
import { z, type ZodObject } from "zod";
import type { $ZodError } from "zod/v4/core";

export function mapZodErrors(errors: $ZodError<Record<string, unknown>>) {
  const isArrayError = errors.issues.some((e) => typeof e.path[0] === "number");

  if (isArrayError) {
    return errors.issues.reduce((acc, e) => {
      const [index, field] = e.path;
      if (typeof index !== "number" || typeof field !== "string") return acc;
      return {
        ...acc,
        [index]: {
          ...(acc[index] || {}),
          [field]: [...(acc[index]?.[field] || []), e.message],
        },
      };
    }, {} as Record<number, Record<string, string[]>>);
  }

  return z.flattenError(errors).fieldErrors;
}

export const validateIdParam = validator("param", (value, c) => {
  const { id } = value;

  if (!validate(id)) {
    return error(c, "Invalid id format", { status: 400 });
  }
});

export function validateBody<T extends ZodObject>(schema: T) {
  return zValidator("json", schema, (result, c) => {
    if (!result.success) {
      return fail(c, mapZodErrors(result.error));
    }
  });
}
