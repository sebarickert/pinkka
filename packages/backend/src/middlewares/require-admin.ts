import {createMiddleware} from 'hono/factory';
import {type AuthType} from '@/lib/auth.js';
import {error} from '@/lib/response.js';

export const requireAdminRole = createMiddleware<AuthType>(async (c, next) => {
	const user = c.get('user');

	if (user.role !== 'admin') {
		return error(c, 'Unauthorized', {status: 401});
	}

	return next();
});
