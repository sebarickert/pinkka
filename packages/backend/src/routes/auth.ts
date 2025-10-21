import { auth, type AuthType } from "@/lib/auth.js";
import { Hono } from "hono";

const router = new Hono<{ Variables: AuthType["Variables"] }>();

router.on(["POST", "GET"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

export default router;
