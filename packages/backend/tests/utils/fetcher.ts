import type {UserWithSessionToken} from '@/test-utils/create-test-user.js';
import {BACKEND_URL, FRONTEND_URL} from '@/lib/env.js';

export async function fetcher(
	input: string,
	init?: RequestInit,
	sessionToken?: UserWithSessionToken['sessionToken'],
) {
	if (!FRONTEND_URL || !BACKEND_URL) {
		throw new Error('FRONTEND_URL and BACKEND_URL must be defined in env');
	}

	return fetch(`${BACKEND_URL}${input}`, {
		...init,
		headers: {
			...init?.headers,
			Origin: FRONTEND_URL,
			Cookie: `better-auth.session_token=${sessionToken}`,
			...(init?.body ? {'Content-Type': 'application/json'} : {}),
		},
	});
}
