import type { AuthType } from "@/lib/auth.js";
import { Hono } from "hono";

export function createRouter() {
  return new Hono<{ Bindings: AuthType }>({
    strict: false,
  });
}

export default function createApp() {
  const app = createRouter();

  return app;
}
