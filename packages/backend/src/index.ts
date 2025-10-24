import {serve} from '@hono/node-server';
import app from '@/app.js';
import {BACKEND_PORT} from '@/lib/env.js';

const port = Number(BACKEND_PORT) || 3000;

console.log(`Server is running on http://localhost:${port}`);

serve({
	fetch: app.fetch,
	port,
});
