import { auth } from "@/lib/auth.js";
import { createRouter } from "@/lib/createRouter.js";

const router = createRouter();

router.on(["POST", "GET"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

export default router;
