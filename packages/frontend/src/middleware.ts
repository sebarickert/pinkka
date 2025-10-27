import {defineMiddleware, sequence} from 'astro:middleware';
import {authClient} from '@/lib/auth-client';

const UNPROTECTED_ROUTES = [
	/^\/$/, // Frontpage
	/^\/login($|\/.*)/, // Matches /login and any query params that may be included
	/^\/register($|\/.*)/,
	// Include your error pages
	/^\/500($|\/.*)/,
	/^\/400($|\/.*)/,
];

// Function for checking whether route needs auth or not 'safe' = no auth required
const isSafeRoute = (path: string): boolean => {
	return UNPROTECTED_ROUTES.some((pattern) => pattern.test(path));
};

const auth = defineMiddleware(async (context, next) => {
	const {data: session} = await authClient.getSession({
		fetchOptions: {
			headers: context.request.headers,
		},
	});

	context.locals.user = session?.user ?? null;
	context.locals.session = session?.session ?? null;

	return next();
});

const routeGuard = defineMiddleware(async (context, next) => {
	const {pathname} = context.url;

	if (isSafeRoute(pathname)) {
		return next();
	}

	const {user, session} = context.locals;

	if (!user || !session) {
		return context.redirect('/login');
	}

	return next();
});

export const onRequest = sequence(auth, routeGuard);
