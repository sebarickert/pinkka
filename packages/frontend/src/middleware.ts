import { defineMiddleware, sequence } from "astro:middleware";
import { authClient } from "@/lib/auth-client";

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
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: context.request.headers,
    },
  });

  context.locals.user = session?.user ?? null;
  context.locals.session = session?.session ?? null;

  return next();
});

const routeGuard = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const { user, session } = context.locals;

  // Redirect authenticated users away from login/register pages
  if (user && ["/login", "/register"].includes(pathname)) {
    return context.redirect("/app/home");
  }

  if (isSafeRoute(pathname)) {
    return next();
  }

  if (!user || !session) {
    return context.redirect("/login");
  }

  return next();
});

export const onRequest = sequence(auth, routeGuard);
