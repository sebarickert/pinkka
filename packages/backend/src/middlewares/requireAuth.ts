import type { AuthType } from "@/lib/auth.js";
import { error } from "@/lib/response.js";
import { createMiddleware } from "hono/factory";

export const requireAuth = createMiddleware<{
  Variables: AuthType["Variables"];
}>(async (c, next) => {
  const user = c.get("user");

  if (!user) {
    return error(c, "Unauthorized", { status: 401 });
  }

  return next();
});
