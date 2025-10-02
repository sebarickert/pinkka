import createApp from "@/lib/create-app.js";
import auth from "@/routes/auth.js";

const app = createApp();

const routes = [auth] as const;

routes.forEach((route) => {
  app.basePath("/api").route("/", route);
});

export type AppType = (typeof routes)[number];

export default app;
