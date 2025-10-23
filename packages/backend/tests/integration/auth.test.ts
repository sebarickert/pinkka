import {beforeAll, describe, expect, test} from 'vitest';
import {fetcher} from '@test-utils/fetcher.js';
import {cleanDb} from '@test-utils/clean-db.js';
import {db} from '@/lib/db.js';
import type {User} from '@/types/db/user.js';

describe('Auth Integration Tests', () => {
	let user: User;
	let session_token: string;

	beforeAll(async () => {
		await cleanDb();
	});

	test('should register new user by email and create user in database', async () => {
		const res = await fetcher('/api/auth/sign-up/email', {
			method: 'POST',
			body: JSON.stringify({
				email: 'test@example.com',
				password: 'password123',
				name: 'Test User',
			}),
		});

		expect(res.status).toBe(200);

		const body = await res.json();
		const setCookie = res.headers.get('set-cookie');
		const match = setCookie?.match(/better-auth\.session_token=([^;]+)/);
		session_token = (match ? match[1] : undefined)!;
		user = body.user;

		expect(body).toHaveProperty('user');
		expect(body.user).toHaveProperty('id');
		expect(body.user.email).toBe('test@example.com');

		const dbUser = await db
			.selectFrom('user')
			.selectAll()
			.where('id', '=', body.user.id)
			.executeTakeFirst();

		expect(dbUser).toBeDefined();
		expect(dbUser?.email).toBe('test@example.com');
		expect(dbUser?.name).toBe('Test User');
	});

	test('should be able to logout', async () => {
		const userSessionBefore = await db
			.selectFrom('session')
			.selectAll()
			.where('user_id', '=', user.id)
			.executeTakeFirst();

		expect(userSessionBefore).toBeDefined();

		const res = await fetcher(
			'/api/auth/sign-out',
			{
				method: 'POST',
			},
			session_token,
		);

		expect(res.status).toBe(200);

		const userSessionAfter = await db
			.selectFrom('session')
			.selectAll()
			.where('user_id', '=', user.id)
			.executeTakeFirst();

		expect(userSessionAfter).toBeUndefined();
	});

	test('should be able to login with email and password', async () => {
		const userSessionBefore = await db
			.selectFrom('session')
			.selectAll()
			.where('user_id', '=', user.id)
			.executeTakeFirst();

		expect(userSessionBefore).toBeUndefined();

		const res = await fetcher('/api/auth/sign-in/email', {
			method: 'POST',
			body: JSON.stringify({
				email: 'test@example.com',
				password: 'password123',
			}),
		});

		expect(res.status).toBe(200);

		const userSessionAfter = await db
			.selectFrom('session')
			.selectAll()
			.where('user_id', '=', user.id)
			.executeTakeFirst();

		expect(userSessionAfter).toBeDefined();
	});
});
