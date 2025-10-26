import {createAuthClient} from 'better-auth/client';
import {adminClient} from 'better-auth/client/plugins';
import {BACKEND_URL} from './env.ts';

export const authClient = createAuthClient({
	baseURL: BACKEND_URL,
	plugins: [adminClient()],
});
