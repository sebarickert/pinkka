import { auth } from "@/lib/auth.js";
import createApp from "@/lib/create-app.js";
import { db } from "@/lib/db.js";
import authRoute from "@/routes/auth.js";
import { cors } from "hono/cors";

const app = createApp();

const routes = [authRoute] as const;

app.use(
  "*",
  cors({
    origin: "http://localhost:4321", // replace with your origin
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

  if (!user) return c.body(null, 401);

  console.log(
    await db
      .selectFrom("user")
      .where("id", "=", "X2LRbFmHDeQ99NgKU5I5eh5T9wCn5Izj")
      .select(["name"])
      .execute()
  );

  return c.json({ message: "pong", user, session });
});

routes.forEach((route) => {
  app.basePath("/api").route("/", route);
});

export type AppType = (typeof routes)[number];

export default app;
