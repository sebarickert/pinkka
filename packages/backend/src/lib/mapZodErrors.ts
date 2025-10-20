import { z } from "zod";
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
