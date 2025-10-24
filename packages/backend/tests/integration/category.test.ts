import {cleanDb} from '@test-utils/clean-db.js';
import {
	type UserWithSessionToken,
	createTestUser,
} from '@test-utils/create-test-user.js';
import {fetcher} from '@test-utils/fetcher.js';
import {createTransaction} from '@test-utils/transaction.js';
import {beforeEach, describe, expect, test} from 'vitest';
import {
	createCategory,
	deleteCategory,
	getCategories,
	getCategory,
	updateCategory,
} from '@test-utils/category.js';
import type {
	CategoryDto,
	UpdateCategoryDto,
} from '@pinkka/schemas/category-dto.js';
import type {FinancialAccountDto} from '@pinkka/schemas/financial-account-dto.js';
import {createFinancialAccount} from '@test-utils/financial-account.js';
import type {JsonResponse} from '@pinkka/schemas/json-response.js';
import {db} from '@/lib/db.js';

describe('Category Integration Tests', () => {
	let user: UserWithSessionToken;

	beforeEach(async () => {
		await cleanDb();
		user = await createTestUser();
	});

	describe('Authorization', () => {
		const protectedEndpoints = [
			{method: 'GET', path: '/api/categories'},
			{method: 'POST', path: '/api/categories'},
			{method: 'GET', path: '/api/categories/some-id'},
			{method: 'PUT', path: '/api/categories/some-id'},
			{method: 'DELETE', path: '/api/categories/some-id'},
		];

		for (const {method, path} of protectedEndpoints) {
			test(`returns 401 for unauthorized ${method} ${path}`, async () => {
				const response = await fetcher(path, {method});
				const body = (await response.json()) as JsonResponse;

				expect(response.status).toEqual(401);
				expect(body.status).toEqual('error');
				if ('message' in body) {
					expect(body.message).toEqual('Unauthorized');
				}
			});
		}
	});

	describe('GET /categories/:id', () => {
		let category: CategoryDto;

		beforeEach(async () => {
			const newCategoryPayload = {
				type: 'income',
				name: 'Hola!',
			} as const;

			const {body} = await createCategory(newCategoryPayload, user);
			category = body.data as CategoryDto;
		});

		test('returns the category for given id', async () => {
			const {status, body} = await getCategory(category.id, user);
			expect(status).toEqual(200);
			expect(body.status).toEqual('success');
			expect(body.data).toMatchObject(category);
		});

		test('returns 404 when category does not exist', async () => {
			const id = 'c2b8f3ee-c9ae-4104-8f89-173e3871ebb9';
			const {status, body} = await getCategory(id, user);
			expect(status).toEqual(404);
			expect(body.status).toEqual('error');
			if ('message' in body) {
				expect(body.message).toBe(`Category with id ${id} not found`);
			}
		});

		test('returns validation error if id is not a valid uuid', async () => {
			const {status, body} = await getCategory('some-non-existing-id', user);
			expect(status).toEqual(400);
			expect(body.status).toEqual('error');
			if ('message' in body) {
				expect(body.message).toBe('Invalid id format');
			}
		});
	});

	describe('GET /categories', () => {
		test('returns empty array when user has no categories', async () => {
			const {status, body} = await getCategories(user);
			expect(status).toEqual(200);
			expect(body.status).toEqual('success');
			expect(body.data).toEqual([]);
		});

		test('returns all categories for user', async () => {
			const category1 = {
				type: 'transfer',
				name: 'Hola!',
			} as const;

			const category2 = {
				type: 'income',
				name: 'Petty Cash',
			} as const;

			await Promise.all([
				createCategory(category1, user),
				createCategory(category2, user),
			]);

			const {status, body} = await getCategories(user);
			expect(status).toEqual(200);
			expect(body.status).toEqual('success');
			expect(body.data).toHaveLength(2);

			for (const category of body.data as CategoryDto[]) {
				expect(category.userId).toEqual(user.id);
			}
		});
	});

	describe('POST /categories', () => {
		const newCategoryPayload = {
			type: 'income',
			name: 'Test category',
		} as const;

		test('returns validation errors if required fields are missing', async () => {
			const {status, body} = await createCategory(undefined, user);
			expect(status).toEqual(400);
			expect(body.status).toEqual('fail');
			expect(body.data).toHaveProperty('name');
			expect(body.data).toHaveProperty('type');
		});

		test('creates category with valid data', async () => {
			const {status, body, data} = await createCategory(
				newCategoryPayload,
				user,
			);
			expect(status).toEqual(201);
			expect(body.status).toEqual('success');

			const newCategory = await db
				.selectFrom('category')
				.where('id', '=', data.id)
				.selectAll()
				.executeTakeFirst();

			expect(newCategory).toMatchObject({
				...newCategoryPayload,
				user_id: user.id,
				is_deleted: false,
			});

			expect(newCategory?.id).toEqual(expect.any(String));
			expect(newCategory?.created_at).toEqual(expect.any(Date));
			expect(newCategory?.updated_at).toEqual(expect.any(Date));
		});
	});

	describe('PUT /categories/:id', () => {
		let category: CategoryDto;

		beforeEach(async () => {
			const newCategoryPayload = {
				type: 'expense',
				name: 'Hola!',
			} as const;

			const {body} = await createCategory(newCategoryPayload, user);
			category = body.data as CategoryDto;
		});

		test('updates category with valid data', async () => {
			const categoryBefore = await db
				.selectFrom('category')
				.where('id', '=', category.id)
				.selectAll()
				.executeTakeFirst();

			const {status, body} = await updateCategory(
				category.id,
				{
					name: 'I was just updated!',
					type: 'income',
				},
				user,
			);

			expect(status).toEqual(200);
			expect(body.status).toEqual('success');

			const categoryAfter = await db
				.selectFrom('category')
				.where('id', '=', category.id)
				.selectAll()
				.executeTakeFirst();

			expect(categoryAfter).not.toMatchObject(categoryBefore!);
		});

		test('sending empty body results in no changes', async () => {
			const categoryBefore = await db
				.selectFrom('category')
				.where('id', '=', category.id)
				.selectAll()
				.executeTakeFirst();

			const {status, body} = await updateCategory(category.id, {}, user);

			expect(status).toEqual(200);
			expect(body.status).toEqual('success');

			const accountAfter = await db
				.selectFrom('category')
				.where('id', '=', category.id)
				.selectAll()
				.executeTakeFirst();

			expect(accountAfter).toMatchObject(categoryBefore!);
		});

		test('returns validation error if id is not a valid uuid', async () => {
			const {status, body} = await updateCategory(
				'some-non-existing-id',
				{},
				user,
			);

			expect(status).toEqual(400);
			expect(body.status).toEqual('error');
			if ('message' in body) {
				expect(body.message).toBe('Invalid id format');
			}
		});

		test('returns validation errors if trying to update with invalid data', async () => {
			const {status, body} = await updateCategory(
				category.id,
				{asd: 'I was just updated!'} as UpdateCategoryDto,
				user,
			);

			expect(status).toEqual(400);
			expect(body.status).toEqual('fail');
		});

		test('returns 404 when trying to update non-existing category', async () => {
			const id = 'c2b8f3ee-c9ae-4104-8f89-173e3871ebb9';

			const {status, body} = await updateCategory(
				id,
				{name: 'I was just updated!'},
				user,
			);

			expect(status).toEqual(404);
			expect(body.status).toEqual('error');
			if ('message' in body) {
				expect(body.message).toBe(`Category with id ${id} not found`);
			}
		});

		test('prevents updating type if category is linked to a transaction', async () => {
			const accountResponse = await createFinancialAccount(
				{
					name: 'Account 1',
					initialBalance: 1000,
					type: 'bank',
				},
				user,
			);
			const account = accountResponse.body.data as FinancialAccountDto;

			const newTransactionPayload = {
				description: 'Grocery Shopping',
				amount: 50,
				fromAccountId: account.id,
				type: 'expense',
				date: new Date().toISOString(),
				categoryId: category.id,
			} as const;

			await createTransaction(newTransactionPayload, user);

			const {status, body} = await updateCategory(
				category.id,
				{
					type: 'income',
				},
				user,
			);

			expect(status).toEqual(400);
			expect(body.status).toEqual('fail');
			expect(body.data).toHaveProperty('type');
		});

		test('returns 404 when trying to update deleted category', async () => {
			await updateCategory(category.id, {isDeleted: true}, user);
			const {status, body} = await updateCategory(
				category.id,
				{
					name: 'Trying to update deleted category',
				},
				user,
			);
			expect(status).toEqual(404);
			expect(body.status).toEqual('error');
			if ('message' in body) {
				expect(body.message).toBe(`Category with id ${category.id} not found`);
			}
		});
	});

	describe('DELETE /categories/:id', () => {
		let category: CategoryDto;

		beforeEach(async () => {
			const newCategoryPayload = {
				type: 'expense',
				name: 'Test category to delete',
			} as const;

			const {body} = await createCategory(newCategoryPayload, user);
			category = body.data as CategoryDto;
		});

		test('soft-deletes the category', async () => {
			const categoryBefore = await db
				.selectFrom('category')
				.where('id', '=', category.id)
				.selectAll()
				.executeTakeFirst();

			expect(categoryBefore?.is_deleted).toEqual(false);

			const {status, body, data} = await deleteCategory(category.id, user);

			expect(status).toEqual(200);
			expect(body.status).toEqual('success');
			expect(data.isDeleted).toEqual(true);

			const categoryAfter = await db
				.selectFrom('category')
				.where('id', '=', category.id)
				.selectAll()
				.executeTakeFirst();

			expect(categoryAfter?.is_deleted).toEqual(true);
		});

		test('returns 404 when trying to delete non-existing category', async () => {
			const id = 'c2b8f3ee-c9ae-4104-8f89-173e3871ebb9';
			const {status, body} = await deleteCategory(id, user);
			expect(status).toEqual(404);
			expect(body.status).toEqual('error');
			if ('message' in body) {
				expect(body.message).toBe(`Category with id ${id} not found`);
			}
		});

		test('returns validation error if id is not a valid uuid', async () => {
			const {status, body} = await deleteCategory('some-non-existing-id', user);
			expect(status).toEqual(400);
			expect(body.status).toEqual('error');
			if ('message' in body) {
				expect(body.message).toBe('Invalid id format');
			}
		});
	});
});
