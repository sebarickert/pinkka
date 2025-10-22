import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import { createRouter } from "@/lib/create-router.js";
import accounts from "@/routes/financial-accounts.js";
import authRoute from "@/routes/auth.js";
import { cors } from "hono/cors";
import categories from "@/routes/categories.js";
import transactions from "@/routes/transactions.js";

const app = createRouter();

const routes = [authRoute, accounts, categories, transactions] as const;

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

routes.forEach((route) => {
  app.basePath("/api").route("/", route);
});

export type AppType = (typeof routes)[number];

export default app;
