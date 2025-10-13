import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import { auth } from "@/lib/auth.js";
import createApp from "@/lib/create-app.js";
import accounts from "@/routes/accounts.js";
import authRoute from "@/routes/auth.js";
import { cors } from "hono/cors";
import categories from "@/routes/categories.js";

const app = createApp();

const routes = [authRoute, accounts, categories] as const;

app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL!,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);

  return next();
});

routes.forEach((route) => {
  app.basePath("/api").route("/", route);
});

export type AppType = (typeof routes)[number];

export default app;
