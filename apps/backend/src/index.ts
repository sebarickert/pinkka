import { serve } from "@hono/node-server";
import app from "@/app.js";
import { BACKEND_PORT } from "@/lib/env.js";

const port = Number(BACKEND_PORT) || 3000;

console.log(`Server is running on http://localhost:${port}`);

const server = serve({
  fetch: app.fetch,
  port,
});

// graceful shutdown
process.on("SIGINT", () => {
  server.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
