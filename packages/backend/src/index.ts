import app from "@/app.js";
import { serve } from "@hono/node-server";

const port = 3000;

 
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
