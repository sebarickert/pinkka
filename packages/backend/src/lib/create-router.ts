import {Hono} from 'hono';
import type {AuthType} from '@/lib/auth.js';

export function createRouter() {
	return new Hono<{Variables: AuthType['Variables']}>({
		strict: false,
	});
}
