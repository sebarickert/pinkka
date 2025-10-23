import dotenv from 'dotenv';
import {cors} from 'hono/cors';
import {createRouter} from '@/lib/create-router.js';
import accounts from '@/routes/financial-accounts.js';
import authRoute from '@/routes/auth.js';
import categories from '@/routes/categories.js';
import transactions from '@/routes/transactions.js';

dotenv.config({path: '../../.env'});

const app = createRouter();

const routes = [authRoute, accounts, categories, transactions] as const;

app.use(
	'*',
	cors({
		origin: process.env.FRONTEND_URL!,
		allowHeaders: ['Content-Type', 'Authorization'],
		allowMethods: ['POST', 'GET', 'OPTIONS'],
		exposeHeaders: ['Content-Length'],
		maxAge: 600,
		credentials: true,
	}),
);

for (const route of routes) {
	app.basePath('/api').route('/', route);
}

export type AppType = (typeof routes)[number];

export default app;
