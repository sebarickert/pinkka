import type { AuthSession, AuthType, AuthUser } from "@/lib/auth.js";
import { error } from "@/lib/response.js";
import { createMiddleware } from "hono/factory";
import { auth } from "@/lib/auth.js";

export const requireAuth = createMiddleware<{
  Variables: {
    user: AuthUser;
    session: AuthSession;
  };
}>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return error(c, "Unauthorized", { status: 401 });
  }

  c.set("user", session.user);
  c.set("session", session.session);

  return next();
});
