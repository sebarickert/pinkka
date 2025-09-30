import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { user } from "./routes/user.js";

const app = new Hono().basePath("/api/v1");

app.route("/user", user);

serve(app);
