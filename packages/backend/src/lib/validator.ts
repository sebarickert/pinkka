import { mapZodErrors } from "@/lib/mapZodErrors.js";
import { error, fail } from "@/lib/response.js";
import { zValidator } from "@hono/zod-validator";
import { validator } from "hono/validator";
import { validate } from "uuid";
import type { ZodObject } from "zod";

export const validateIdParam = validator("param", (value, c) => {
  const { id } = value;

  if (!validate(id)) {
    return error(c, "Invalid id format", { status: 400 });
  }
});

export const validateBody = <T extends ZodObject>(schema: T) => {
  return zValidator("json", schema, (result, c) => {
    if (!result.success) {
      return fail(c, mapZodErrors(result.error));
    }
  });
};
