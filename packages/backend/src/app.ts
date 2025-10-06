import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import { auth } from "@/lib/auth.js";
import createApp from "@/lib/create-app.js";
// import { db } from "@/lib/db.js";
import accounts from "@/routes/accounts.js";
import authRoute from "@/routes/auth.js";
import { cors } from "hono/cors";

const app = createApp();

const routes = [authRoute, accounts] as const;

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

// Simple test endpoint
app.get("/api/ping", async (c) => {
  const session = c.get("session");
  const user = c.get("user");

  console.log(session, user);

  if (!user) return c.body(null, 401);

  // console.log(
  //   await db
  //     .selectFrom("user")
  //     .where("id", "=", "83cc6094-9d89-40cc-b841-7210e30362c0")
  //     .select(["name"])
  //     .execute()
  // );

  return c.json({ message: "pong", user, session });
});

routes.forEach((route) => {
  app.basePath("/api").route("/", route);
});

export type AppType = (typeof routes)[number];

export default app;
