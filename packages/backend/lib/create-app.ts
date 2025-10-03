import type { AuthType } from "@/lib/auth.js";
import { Hono } from "hono";

export function createRouter() {
  return new Hono<{ Variables: AuthType["Variables"] }>({
    strict: false,
  });
}

export default function createApp() {
  const app = createRouter();

  return app;
}
