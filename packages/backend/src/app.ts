import { cors } from "hono/cors";
import { createRouter } from "@/lib/create-router.js";
import accounts from "@/routes/financial-accounts.js";
import authRoute from "@/routes/auth.js";
import categories from "@/routes/categories.js";
import transactions from "@/routes/transactions.js";
import { FRONTEND_URL } from "@/lib/env.js";
import migrations from "@/routes/migrations.js";

const app = createRouter();
const routes = [
  authRoute,
  accounts,
  categories,
  transactions,
  migrations,
] as const;

if (FRONTEND_URL) {
  app.use(
    "*",
    cors({
      origin: FRONTEND_URL,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    })
  );
}

for (const route of routes) {
  app.basePath("/api").route("/", route);
}

export type AppType = (typeof routes)[number];

export default app;
