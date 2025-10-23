
import {
	beforeEach, describe, expect, test,
} from 'vitest';
import {cleanDb} from 'tests/utils/clean-db.js';
import {createAccount} from '@test-utils/create-account.js';
import {
	type UserWithSessionToken,
	createTestUser,
} from '@test-utils/create-test-user.js';
import {fetcher} from '@test-utils/fetcher.js';
import {createTransaction} from '@test-utils/transaction.js';
import type {FinancialAccount} from '@/types/db/FinancialAccount.js';
import {db} from '@/lib/db.js';

describe('Financial Account Integration Tests', () => {
	let user: UserWithSessionToken;

	beforeEach(async () => {
		await cleanDb();
		user = await createTestUser();
	});

	describe('Authorization', () => {
		const protectedEndpoints = [
			{method: 'GET', path: '/api/accounts'},
			{method: 'POST', path: '/api/accounts'},
			{method: 'GET', path: '/api/accounts/some-id'},
			{method: 'PUT', path: '/api/accounts/some-id'},
			{method: 'DELETE', path: '/api/accounts/some-id'},
		];

		for (const {method, path} of protectedEndpoints) {
			test(`returns 401 for unauthorized ${method} ${path}`, async () => {
				const res = await fetcher(path, {method});
				const body = await res.json();

				expect(res.status).toEqual(401);
				expect(body.status).toEqual('error');
				expect(body.message).toBe('Unauthorized');
			});
		}
	});

	describe('GET /accounts/:id', () => {
		let account: any;

		beforeEach(async () => {
			const newAccountPayload = {
				type: 'bank',
				name: 'Hola!',
				currency: 'EUR',
				initial_balance: 1000,
			} as const;

			account = await createAccount(newAccountPayload, user);
		});

		test('returns the financial account for given id', async () => {
			const res = await fetcher(
				`/api/accounts/${account.id}`,
				{},
				user.session_token,
			);

			const body = await res.json();

			expect(res.status).toEqual(200);
			expect(body.status).toEqual('success');
			expect(body.data).toMatchObject(account);
		});

		test('returns 404 when account does not exist', async () => {
			const id = 'c2b8f3ee-c9ae-4104-8f89-173e3871ebb9';

			const res = await fetcher(`/api/accounts/${id}`, {}, user.session_token);

			const body = await res.json();

			expect(res.status).toEqual(404);
			expect(body.status).toEqual('error');
			expect(body.message).toBe(`Financial account with id ${id} not found`);
		});

		test('returns validation error if id is not a valid uuid', async () => {
			const res = await fetcher(
				'/api/accounts/some-non-existing-id',
				{},
				user.session_token,
			);

			const body = await res.json();

			expect(res.status).toEqual(400);
			expect(body.status).toEqual('error');
			expect(body.message).toBe('Invalid id format');
		});
	});

	describe('GET /accounts', () => {
		test('returns empty array when user has no financial accounts', async () => {
			const res = await fetcher('/api/accounts', {}, user.session_token);

			const body = await res.json();

			expect(res.status).toEqual(200);
			expect(body.status).toEqual('success');
			expect(body.data).toEqual([]);
		});

		test('returns all financial accounts for user', async () => {
			const newAccounts = [
				{
					type: 'bank',
					name: 'Hola!',
					currency: 'EUR',
					initial_balance: 1000,
				},
				{
					type: 'wallet',
					name: 'Petty Cash',
					currency: 'USD',
					initial_balance: 500,
				},
			];

			for (const account of newAccounts) {
				await fetcher(
					'/api/accounts',
					{
						method: 'POST',
						body: JSON.stringify(account),
					},
					user.session_token,
				);
			}

			const res = await fetcher('/api/accounts', {}, user.session_token);

			const body = await res.json();

			expect(res.status).toEqual(200);
			expect(body.status).toEqual('success');
			expect(body.data).toHaveLength(newAccounts.length);

			body.data.forEach((account: any) => {
				expect(account.user_id).toEqual(user.id);
			});
		});
	});

	describe('POST /accounts', () => {
		const newAccountPayload = {
			type: 'bank',
			name: 'Hola!',
			currency: 'EUR',
			initial_balance: 1000,
		};

		test('returns validation errors if required fields are missing', async () => {
			const res = await fetcher(
				'/api/accounts',
				{
					method: 'POST',
				},
				user.session_token,
			);

			const body = await res.json();

			expect(res.status).toEqual(400);
			expect(body.status).toEqual('fail');
			expect(body.data).toHaveProperty('name');
			expect(body.data).toHaveProperty('initial_balance');
		});

		test('creates financial account with valid data', async () => {
			const res = await fetcher(
				'/api/accounts',
				{
					method: 'POST',
					body: JSON.stringify(newAccountPayload),
				},
				user.session_token,
			);

			const body = await res.json();

			expect(res.status).toEqual(201);
			expect(body.status).toEqual('success');

			const newAccountId = body.data.id;

			const newAccount = await db
				.selectFrom('financial_account')
				.where('id', '=', newAccountId)
				.selectAll()
				.executeTakeFirst();

			expect(newAccount).toMatchObject({
				...newAccountPayload,
				id: newAccount?.id,
				initial_balance: newAccountPayload.initial_balance.toString(),
				balance: newAccountPayload.initial_balance.toString(),
			});

			expect(newAccount?.is_deleted).toBeDefined();
			expect(newAccount?.created_at).toBeDefined();
			expect(newAccount?.updated_at).toBeDefined();
		});

		test('creates financial account with negative initial_balance', async () => {
			const newAccountPayloadNegative = {
				...newAccountPayload,
				initial_balance: -1000,
			};

			const res = await fetcher(
				'/api/accounts',
				{
					method: 'POST',
					body: JSON.stringify(newAccountPayloadNegative),
				},
				user.session_token,
			);

			const body = await res.json();

			expect(res.status).toEqual(201);
			expect(body.status).toEqual('success');

			const newAccountId = body.data.id;

			const newAccount = await db
				.selectFrom('financial_account')
				.where('id', '=', newAccountId)
				.selectAll()
				.executeTakeFirst();

			expect(newAccount).toMatchObject({
				...newAccountPayload,
				id: newAccount?.id,
				initial_balance: newAccountPayloadNegative.initial_balance.toString(),
				balance: newAccountPayloadNegative.initial_balance.toString(),
			});

			expect(newAccount?.is_deleted).toBeDefined();
			expect(newAccount?.created_at).toBeDefined();
			expect(newAccount?.updated_at).toBeDefined();
		});
	});

	describe('PUT /accounts/:id', () => {
		let account: FinancialAccount;

		beforeEach(async () => {
			const newAccountPayload = {
				type: 'bank',
				name: 'Hola!',
				currency: 'EUR',
				initial_balance: 1000,
			} as const;

			account = await createAccount(newAccountPayload, user);
		});

		test('updates financial account with valid data', async () => {
			const accountBefore = await db
				.selectFrom('financial_account')
				.where('id', '=', account.id)
				.selectAll()
				.executeTakeFirst();

			const res = await fetcher(
				`/api/accounts/${account.id}`,
				{
					method: 'PUT',
					body: JSON.stringify({
						name: 'I was just updated!',
						currency: 'USD',
						type: 'wallet',
						initial_balance: 5000,
					}),
				},
				user.session_token,
			);

			const body = await res.json();

			expect(res.status).toEqual(200);
			expect(body.status).toEqual('success');

			const accountAfter = await db
				.selectFrom('financial_account')
				.where('id', '=', account.id)
				.selectAll()
				.executeTakeFirst();

			expect(accountAfter).not.toMatchObject(accountBefore!);
		});

		test('sending empty body results in no changes', async () => {
			const accountBefore = await db
				.selectFrom('financial_account')
				.where('id', '=', account.id)
				.selectAll()
				.executeTakeFirst();

			const res = await fetcher(
				`/api/accounts/${account.id}`,
				{
					method: 'PUT',
				},
				user.session_token,
			);

			const body = await res.json();

			expect(res.status).toEqual(200);
			expect(body.status).toEqual('success');

			const accountAfter = await db
				.selectFrom('financial_account')
				.where('id', '=', account.id)
				.selectAll()
				.executeTakeFirst();

			expect(accountAfter).toMatchObject(accountBefore!);
		});

		test('returns validation error if id is not a valid uuid', async () => {
			const res = await fetcher(
				'/api/accounts/some-non-existing-id',
				{
					method: 'PUT',
					body: JSON.stringify({
						name: 'I do not exist',
					}),
				},
				user.session_token,
			);

			const body = await res.json();

			expect(res.status).toEqual(400);
			expect(body.status).toEqual('error');
			expect(body.message).toBe('Invalid id format');
		});

		test('returns validation errors if trying to update with invalid data', async () => {
			const res = await fetcher(
				`/api/accounts/${account.id}`,
				{
					method: 'PUT',
					body: JSON.stringify({
						name: 'I was just updated!',
						currency: 123,
						type: 'wrong',
						initial_balance: 5000,
					}),
				},
				user.session_token,
			);

			const body = await res.json();

			expect(res.status).toEqual(400);
			expect(body.status).toEqual('fail');
			expect(body.data).toHaveProperty('currency');
			expect(body.data).toHaveProperty('type');
		});

		test('returns 404 when trying to update non-existing account', async () => {
			const id = 'c2b8f3ee-c9ae-4104-8f89-173e3871ebb9';

			const res = await fetcher(
				`/api/accounts/${id}`,
				{
					method: 'PUT',
					body: JSON.stringify({
						name: 'I do not exist',
					}),
				},
				user.session_token,
			);

			const body = await res.json();

			expect(res.status).toEqual(404);
			expect(body.status).toEqual('error');
			expect(body.message).toBe(`Financial account with id ${id} not found`);
		});

		test('prevents updating initial_balance if account has transactions', async () => {
			const newTransactionPayload = {
				description: 'Grocery Shopping',
				amount: 50,
				from_account_id: account.id,
				type: 'expense',
				date: new Date().toISOString(),
			} as const;

			await createTransaction(newTransactionPayload, user);

			const res = await fetcher(
				`/api/accounts/${account.id}`,
				{
					method: 'PUT',
					body: JSON.stringify({
						initial_balance: 6000,
					}),
				},
				user.session_token,
			);

			const body = await res.json();

			expect(res.status).toEqual(400);
			expect(body.status).toEqual('fail');
			expect(body.data).toHaveProperty('initial_balance');
		});

		test('returns 404 when trying to update deleted account', async () => {
			await fetcher(
				`/api/accounts/${account.id}`,
				{
					method: 'PUT',
					body: JSON.stringify({
						is_deleted: true,
					}),
				},
				user.session_token,
			);

			const res = await fetcher(
				`/api/accounts/${account.id}`,
				{
					method: 'PUT',
					body: JSON.stringify({
						name: 'Trying to update deleted account',
					}),
				},
				user.session_token,
			);

			const body = await res.json();

			expect(res.status).toEqual(404);
			expect(body.status).toEqual('error');
			expect(body.message).toBe(`Financial account with id ${account.id} not found`);
		});
	});

	describe('DELETE /accounts/:id', () => {
		let account: any;

		beforeEach(async () => {
			const newAccountPayload = {
				type: 'bank',
				name: 'Hola!',
				currency: 'EUR',
				initial_balance: 1000,
			} as const;

			account = await createAccount(newAccountPayload, user);
		});

		test('soft-deletes the financial account', async () => {
			const accountBefore = await db
				.selectFrom('financial_account')
				.where('id', '=', account.id)
				.selectAll()
				.executeTakeFirst();

			expect(accountBefore?.is_deleted).toBe(false);

			const res = await fetcher(
				`/api/accounts/${account.id}`,
				{
					method: 'DELETE',
				},
				user.session_token,
			);

			const body = await res.json();

			expect(res.status).toEqual(200);
			expect(body.status).toEqual('success');
			expect(body.data.is_deleted).toBe(true);

			const accountAfter = await db
				.selectFrom('financial_account')
				.where('id', '=', account.id)
				.selectAll()
				.executeTakeFirst();

			expect(accountAfter?.is_deleted).toBe(true);
		});

		test('returns 404 when trying to delete non-existing account', async () => {
			const id = 'c2b8f3ee-c9ae-4104-8f89-173e3871ebb9';

			const res = await fetcher(
				`/api/accounts/${id}`,
				{
					method: 'DELETE',
				},
				user.session_token,
			);

			const body = await res.json();

			expect(res.status).toEqual(404);
			expect(body.status).toEqual('error');
			expect(body.message).toBe(`Financial account with id ${id} not found`);
		});

		test('returns validation error if id is not a valid uuid', async () => {
			const res = await fetcher(
				'/api/accounts/some-non-existing-id',
				{
					method: 'DELETE',
				},
				user.session_token,
			);

			const body = await res.json();

			expect(res.status).toEqual(400);
			expect(body.status).toEqual('error');
			expect(body.message).toBe('Invalid id format');
		});
	});
});
