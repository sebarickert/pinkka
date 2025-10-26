import {beforeEach, describe, expect, test} from 'vitest';
import type {FinancialAccountDto} from '@pinkka/schemas/financial-account-dto.js';
import type {
	NewTransactionDto,
	TransactionDto,
} from '@pinkka/schemas/transaction-dto.js';
import type {CategoryDto} from '@pinkka/schemas/category-dto.js';
import type {JsonResponse} from '@pinkka/schemas/json-response.js';
import {cleanDb} from '@/test-utils/clean-db.js';
import {
	type UserWithSessionToken,
	createTestUser,
} from '@/test-utils/create-test-user.js';
import {fetcher} from '@/test-utils/fetcher.js';
import {
	createFinancialAccount,
	getFinancialAccountBalances,
} from '@/test-utils/financial-account.js';
import {
	createTransaction,
	getTransaction,
	expectCategoryLink,
	updateTransaction,
	getTransactions,
	deleteTransaction,
} from '@/test-utils/transaction.js';
import {createCategory} from '@/test-utils/category.js';
import {db} from '@/lib/db.js';

describe('Transaction Integration Tests', () => {
	let user: UserWithSessionToken;
	let account: FinancialAccountDto;

	beforeEach(async () => {
		await cleanDb();
		user = await createTestUser();

		const {data} = await createFinancialAccount(
			{
				name: 'Test Account',
				initialBalance: 1000,
				type: 'bank',
			},
			user,
		);
		account = data;
	});

	describe('Authorization', () => {
		const protectedEndpoints = [
			{method: 'GET', path: '/api/transactions'},
			{method: 'POST', path: '/api/transactions'},
			{method: 'GET', path: '/api/transactions/some-id'},
			{method: 'PUT', path: '/api/transactions/some-id'},
			{method: 'DELETE', path: '/api/transactions/some-id'},
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

	describe('GET /transactions/:id', () => {
		let transaction: TransactionDto;

		beforeEach(async () => {
			const newTransactionPayload = {
				description: 'Grocery Shopping',
				amount: 50,
				fromAccountId: account.id,
				type: 'expense',
				date: new Date().toISOString(),
			} as const;

			const {data} = await createTransaction(newTransactionPayload, user);
			transaction = data;
		});

		test('returns the transaction for given id', async () => {
			const {status, body} = await getTransaction(transaction.id, user);
			expect(status).toEqual(200);
			expect(body.status).toEqual('success');
			expect(body.data).toMatchObject(transaction);
		});

		test('returns 404 when transaction does not exist', async () => {
			const id = 'c2b8f3ee-c9ae-4104-8f89-173e3871ebb9';
			const {status, body} = await getTransaction(id, user);
			expect(status).toEqual(404);
			expect(body.status).toEqual('error');
			if ('message' in body) {
				expect(body.message).toEqual(`Transaction with id ${id} not found`);
			}
		});

		test('returns validation error if id is not a valid uuid', async () => {
			const {status, body} = await getTransaction('some-non-existing-id', user);
			expect(status).toEqual(400);
			expect(body.status).toEqual('error');
			if ('message' in body) {
				expect(body.message).toEqual('Invalid id format');
			}
		});
	});

	describe('GET /transactions', () => {
		test('returns empty array when user has no transactions', async () => {
			const {status, body, data} = await getTransactions(user);
			expect(status).toEqual(200);
			expect(body.status).toEqual('success');
			expect(data).toEqual([]);
		});

		test('returns all transactions for user', async () => {
			const newTransactionPayload = {
				description: 'Grocery Shopping',
				amount: 50,
				fromAccountId: account.id,
				type: 'expense',
				date: new Date().toISOString(),
			} as const;

			await Promise.all(
				Array.from({length: 5}, async (_, i) =>
					createTransaction(
						{
							...newTransactionPayload,
							amount: 50 + i * 10,
						},
						user,
					),
				),
			);

			const {status, body, data} = await getTransactions(user);
			expect(status).toEqual(200);
			expect(body.status).toEqual('success');
			expect(data).toHaveLength(5);
			for (const transaction of data) {
				expect(transaction.userId).toEqual(user.id);
			}
		});
	});

	describe('POST /transactions', async () => {
		let categoryExpense: CategoryDto;

		beforeEach(async () => {
			const newExpenseCategoryPayload = {
				type: 'expense',
				name: 'Hola!',
			} as const;

			const {body} = await createCategory(newExpenseCategoryPayload, user);
			categoryExpense = body.data as CategoryDto;
		});

		test('returns validation error for empty body', async () => {
			const {status, body} = await createTransaction(undefined, user);
			expect(status).toEqual(400);
			expect(body.status).toEqual('fail');
			expect(body.data).toHaveProperty('type');
			expect(body.data).toHaveProperty('amount');
			expect(body.data).toHaveProperty('date');
			expect(body.data).toHaveProperty('description');
		});

		test('returns validation error for invalid data', async () => {
			const newTransactionPayload = {
				amount: 50,
				fromAccountId: account.id,
				type: 'expense',
				date: 'invalid-date',
			} as unknown as NewTransactionDto;

			const {status, body} = await createTransaction(
				newTransactionPayload,
				user,
			);

			expect(status).toEqual(400);
			expect(body.status).toEqual('fail');
			expect(body.data).toHaveProperty('date');
			expect(body.data).toHaveProperty('description');
		});

		test.each([
			['toAccountId', 'expense'],
			['fromAccountId', 'income'],
		])(
			'returns validation error when %s is combined with type %s',
			async (key, type) => {
				const newTransactionPayload = {
					amount: 50,
					description: 'Test Transaction',
					date: new Date().toISOString(),
					[key]: account.id,
					type,
				} as unknown as NewTransactionDto;

				const {status, body} = await createTransaction(
					newTransactionPayload,
					user,
				);

				expect(status).toEqual(400);
				expect(body.status).toEqual('fail');
				expect(body.data).toHaveProperty(key);
			},
		);

		test('returns validation error when transfer from and to accounts are the same', async () => {
			const newTransactionPayload = {
				description: 'Grocery Shopping',
				amount: 50,
				toAccountId: account.id,
				fromAccountId: account.id,
				type: 'transfer',
				date: new Date().toISOString(),
				categoryId: categoryExpense.id,
			} as const;

			const {status, body} = await createTransaction(
				newTransactionPayload,
				user,
			);

			expect(status).toEqual(400);
			expect(body.status).toEqual('fail');
			expect(body.data).toHaveProperty('toAccountId');
			expect(body.data).toHaveProperty('fromAccountId');
		});

		test('creates transaction with valid data (with category)', async () => {
			const newTransactionPayload = {
				description: 'Grocery Shopping',
				amount: 50,
				fromAccountId: account.id,
				type: 'expense',
				date: new Date().toISOString(),
				categoryId: categoryExpense.id,
			} as const;

			const {data} = await createTransaction(newTransactionPayload, user);

			const {categoryId, ...expectedTransaction} = newTransactionPayload;

			expect(data).toHaveProperty('id');
			expect(data).toMatchObject({
				...expectedTransaction,
				date: expectedTransaction.date,
			});

			const transactionCategoryLink = await db
				.selectFrom('transaction_category')
				.where('transaction_id', '=', data.id)
				.selectAll()
				.execute();

			expect(transactionCategoryLink).toHaveLength(1);
			expect(transactionCategoryLink[0].category_id).toEqual(
				categoryExpense.id,
			);
		});

		describe('Account Balance Updates', () => {
			let account1: FinancialAccountDto;
			let account2: FinancialAccountDto;

			beforeEach(async () => {
				const {body: body1} = await createFinancialAccount(
					{
						name: 'Account 1',
						initialBalance: 1000,
						type: 'bank',
					},
					user,
				);
				const {body: body2} = await createFinancialAccount(
					{
						name: 'Account 2',
						initialBalance: 1000,
						type: 'bank',
					},
					user,
				);

				account1 = body1.data as FinancialAccountDto;
				account2 = body2.data as FinancialAccountDto;
			});

			test('updates account balance correctly for income transaction', async () => {
				const balancesBefore = await getFinancialAccountBalances(account1.id);

				const newTransactionPayload = {
					description: 'Grocery Shopping',
					amount: 250,
					toAccountId: account1.id,
					type: 'income',
					date: new Date().toISOString(),
				} as const;

				await createTransaction(newTransactionPayload, user);
				const balancesAfter = await getFinancialAccountBalances(account1.id);

				expect(balancesAfter.balance).toEqual(
					balancesBefore.balance + newTransactionPayload.amount,
				);
			});

			test('updates account balance correctly for expense transaction', async () => {
				const balancesBefore = await getFinancialAccountBalances(account1.id);

				const newTransactionPayload = {
					description: 'Grocery Shopping',
					amount: 250,
					fromAccountId: account1.id,
					type: 'expense',
					date: new Date().toISOString(),
				} as const;

				await createTransaction(newTransactionPayload, user);
				const balancesAfter = await getFinancialAccountBalances(account1.id);

				expect(balancesAfter.balance).toEqual(
					balancesBefore.balance - newTransactionPayload.amount,
				);
			});

			test('updates account balances correctly for transfer transaction', async () => {
				const fromBefore = await getFinancialAccountBalances(account1.id);
				const toBefore = await getFinancialAccountBalances(account2.id);

				const newTransactionPayload = {
					description: 'Grocery Shopping',
					amount: 99.99,
					fromAccountId: account1.id,
					toAccountId: account2.id,
					type: 'transfer',
					date: new Date().toISOString(),
				} as const;

				await createTransaction(newTransactionPayload, user);

				const fromAfter = await getFinancialAccountBalances(account1.id);
				const toAfter = await getFinancialAccountBalances(account2.id);

				expect(fromAfter.balance).toEqual(
					fromBefore.balance - newTransactionPayload.amount,
				);
				expect(toAfter.balance).toEqual(
					toBefore.balance + newTransactionPayload.amount,
				);
			});

			test('does not update balance for zero-amount transaction', async () => {
				const balancesBefore = await getFinancialAccountBalances(account1.id);

				const newTransactionPayload = {
					description: 'Grocery Shopping',
					amount: 0,
					fromAccountId: account1.id,
					type: 'expense',
					date: new Date().toISOString(),
				} as const;

				await createTransaction(newTransactionPayload, user);
				const balancesAfter = await getFinancialAccountBalances(account1.id);
				expect(balancesAfter?.balance).toEqual(balancesBefore?.balance);
			});
		});
	});

	describe('PUT /transactions/:id', () => {
		let transaction1: TransactionDto;
		let transaction2: TransactionDto;
		let category1: CategoryDto;
		let category2: CategoryDto;
		let category3: CategoryDto;

		beforeEach(async () => {
			const newCategoryPayload = {
				type: 'expense',
				name: 'Hola!',
			} as const;

			const response1 = await createCategory(newCategoryPayload, user);
			category1 = response1.data;
			const response2 = await createCategory(newCategoryPayload, user);
			category2 = response2.data;
			const response3 = await createCategory(
				{...newCategoryPayload, type: 'income'},
				user,
			);
			category3 = response3.data;

			const newTransactionPayload = {
				description: 'Grocery Shopping',
				amount: 50,
				fromAccountId: account.id,
				type: 'expense',
				date: new Date().toISOString(),
			} as const;

			const responseTx1 = await createTransaction(newTransactionPayload, user);
			transaction1 = responseTx1.data;
			const responseTx2 = await createTransaction(
				{...newTransactionPayload, amount: 100, categoryId: category1.id},
				user,
			);
			transaction2 = responseTx2.data;
		});

		describe('Category Link Management', () => {
			test('adds category link', async () => {
				const {data: transactionBefore} = await getTransaction(
					transaction1.id,
					user,
				);
				await expectCategoryLink(transaction1.id, null);

				const {status, body} = await updateTransaction(
					transaction1.id,
					{
						amount: 100,
						description: 'I was just updated!',
						categoryId: category1.id,
					},
					user,
				);

				expect(status).toEqual(200);
				expect(body.status).toEqual('success');

				await expectCategoryLink(transaction1.id, category1.id);
				const {data: transactionAfter} = await getTransaction(
					transaction1.id,
					user,
				);
				expect(transactionAfter).not.toMatchObject(transactionBefore);
			});

			test('updates category link', async () => {
				await expectCategoryLink(transaction2.id, category1.id);
				const {status, body} = await updateTransaction(
					transaction2.id,
					{
						amount: 100,
						description: 'I was just updated!',
						categoryId: category2.id,
					},
					user,
				);
				expect(status).toEqual(200);
				expect(body.status).toEqual('success');
				await expectCategoryLink(transaction2.id, category2.id);
			});

			test('removes category link', async () => {
				await expectCategoryLink(transaction2.id, category1.id);
				const {status, body} = await updateTransaction(
					transaction2.id,
					{categoryId: null},
					user,
				);
				expect(status).toEqual(200);
				expect(body.status).toEqual('success');
				await expectCategoryLink(transaction2.id, null);
			});

			test('rejects mismatched category type', async () => {
				const {status, body, data} = await updateTransaction(
					transaction1.id,
					{categoryId: category3.id},
					user,
				);
				expect(status).toEqual(400);
				expect(body.status).toEqual('fail');
				expect(data).toHaveProperty('categoryId');
				if ('categoryId' in data) {
					expect(data.categoryId).toEqual(
						'Category type does not match transaction type',
					);
				}

				await expectCategoryLink(transaction1.id, null);
			});

			test('rejects non-existent categoryId', async () => {
				const fakeCategoryId = '00000000-0000-0000-0000-000000000000';
				const {status, body} = await updateTransaction(
					transaction1.id,
					{categoryId: fakeCategoryId},
					user,
				);
				expect(status).toEqual(404);
				expect(body.status).toEqual('error');
				if ('message' in body) {
					expect(body.message).toEqual(
						`Category with id ${fakeCategoryId} not found`,
					);
				}

				await expectCategoryLink(transaction1.id, null);
			});
		});

		describe('General Update & Validation', () => {
			test('updates amount and description only (no category)', async () => {
				const {data: transactionBefore} = await getTransaction(
					transaction1.id,
					user,
				);
				await expectCategoryLink(transaction1.id, null);

				const {status, body} = await updateTransaction(
					transaction1.id,
					{
						amount: transactionBefore.amount + 10,
						description: 'Updated description only',
					},
					user,
				);

				expect(status).toEqual(200);
				expect(body.status).toEqual('success');

				const {data: transactionAfter} = await getTransaction(
					transaction1.id,
					user,
				);
				expect(transactionAfter.amount).toEqual(transactionBefore.amount + 10);
				expect(transactionAfter.description).toEqual(
					'Updated description only',
				);
				await expectCategoryLink(transaction1.id, null);
			});

			test('sending empty body results in no changes', async () => {
				const transactionBefore = await getTransaction(transaction1.id, user);
				const {status, body} = await updateTransaction(
					transaction1.id,
					undefined,
					user,
				);
				expect(status).toEqual(200);
				expect(body.status).toEqual('success');
				const transactionAfter = await getTransaction(transaction1.id, user);
				expect(transactionAfter).toMatchObject(transactionBefore);
			});

			test('returns validation error if id is not a valid uuid', async () => {
				const {status, body} = await updateTransaction(
					'some-non-existing-id',
					{},
					user,
				);
				expect(status).toEqual(400);
				expect(body.status).toEqual('error');
				if ('message' in body) {
					expect(body.message).toEqual('Invalid id format');
				}
			});

			test('returns validation errors if trying to update with invalid data', async () => {
				const {status, body} = await updateTransaction(
					transaction1.id,
					{
						amount: -123,
						description: 123,
					} as unknown as Partial<NewTransactionDto>,
					user,
				);

				expect(status).toEqual(400);
				expect(body.status).toEqual('fail');
				expect(body.data).toHaveProperty('amount');
				expect(body.data).toHaveProperty('description');
			});

			test('returns 404 when trying to update non-existing transaction', async () => {
				const id = 'c2b8f3ee-c9ae-4104-8f89-173e3871ebb9';

				const {status, body} = await updateTransaction(
					id,
					{
						amount: 123,
						description: 'I do not exist',
					},
					user,
				);

				expect(status).toEqual(404);
				expect(body.status).toEqual('error');
				if ('message' in body) {
					expect(body.message).toEqual(`Transaction with id ${id} not found`);
				}
			});
		});

		describe('Account Balance Updates', () => {
			let account1: FinancialAccountDto;
			let account2: FinancialAccountDto;
			let transactionExpense: TransactionDto;
			let transactionIncome: TransactionDto;
			let transactionTransfer: TransactionDto;

			beforeEach(async () => {
				const responseAcc1 = await createFinancialAccount(
					{
						name: 'Account 1',
						initialBalance: 1000,
						type: 'bank',
					},
					user,
				);
				account1 = responseAcc1.data;

				const responseAcc2 = await createFinancialAccount(
					{
						name: 'Account 1',
						initialBalance: 1000,
						type: 'bank',
					},
					user,
				);
				account2 = responseAcc2.data;

				const newTransactionPayload = {
					description: 'Grocery Shopping',
					amount: 100,
					date: new Date().toISOString(),
				} as const;

				const responseExpense = await createTransaction(
					{
						...newTransactionPayload,
						fromAccountId: account1.id,
						type: 'expense',
					},
					user,
				);
				transactionExpense = responseExpense.body.data as TransactionDto;

				const responseIncome = await createTransaction(
					{
						...newTransactionPayload,
						toAccountId: account2.id,
						type: 'income',
					},
					user,
				);
				transactionIncome = responseIncome.body.data as TransactionDto;

				const responseTransfer = await createTransaction(
					{
						...newTransactionPayload,
						fromAccountId: account1.id,
						toAccountId: account2.id,
						type: 'transfer',
					},
					user,
				);
				transactionTransfer = responseTransfer.body.data as TransactionDto;
			});

			test.each([1, 50, 0, -1, -50, -99.99])(
				'updates account balance correctly when amount is changed by %s for income transaction',
				async (changeAmount) => {
					const accountBalanceBefore = await getFinancialAccountBalances(
						account2.id,
					);

					const {status} = await updateTransaction(
						transactionIncome.id,
						{amount: transactionIncome.amount + changeAmount},
						user,
					);

					expect(status).toEqual(200);

					const accountBalanceAfter = await getFinancialAccountBalances(
						account2.id,
					);

					expect(accountBalanceAfter?.balance).toEqual(
						accountBalanceBefore.balance + changeAmount,
					);
				},
			);

			test.each([1, 50, 0, -1, -50, -99.99])(
				'updates account balance correctly when amount is changed by %s for expense transaction',
				async (changeAmount) => {
					const accountBalanceBefore = await getFinancialAccountBalances(
						account1.id,
					);

					const {status} = await updateTransaction(
						transactionExpense.id,
						{amount: transactionExpense.amount + changeAmount},
						user,
					);

					expect(status).toEqual(200);

					const accountBalanceAfter = await getFinancialAccountBalances(
						account1.id,
					);

					expect(accountBalanceAfter?.balance).toEqual(
						accountBalanceBefore.balance - changeAmount,
					);
				},
			);

			test.each([1, 50, 0, -1, -50, -99.99])(
				'updates account balance correctly when amount is changed by %s for transfer transaction',
				async (changeAmount) => {
					const account1BalanceBefore = await getFinancialAccountBalances(
						account1.id,
					);
					const account2BalanceBefore = await getFinancialAccountBalances(
						account2.id,
					);

					const {status} = await updateTransaction(
						transactionTransfer.id,
						{amount: transactionTransfer.amount + changeAmount},
						user,
					);

					expect(status).toEqual(200);

					const account1BalanceAfter = await getFinancialAccountBalances(
						account1.id,
					);
					const account2BalanceAfter = await getFinancialAccountBalances(
						account2.id,
					);

					expect(account1BalanceAfter?.balance).toEqual(
						account1BalanceBefore.balance - changeAmount,
					);
					expect(account2BalanceAfter?.balance).toEqual(
						account2BalanceBefore.balance + changeAmount,
					);
				},
			);
		});
	});

	describe('DELETE /transactions/:id', () => {
		let transaction: TransactionDto;

		beforeEach(async () => {
			const newTransactionPayload = {
				description: 'Grocery Shopping',
				amount: 50,
				fromAccountId: account.id,
				type: 'expense',
				date: new Date().toISOString(),
			} as const;

			const responseTransaction = await createTransaction(
				newTransactionPayload,
				user,
			);
			transaction = responseTransaction.body.data as TransactionDto;
		});

		test('deletes category link when transaction is deleted', async () => {
			const newExpenseCategoryPayload = {
				type: 'expense',
				name: 'Hola!',
			} as const;

			const {data: categoryExpense} = await createCategory(
				newExpenseCategoryPayload,
				user,
			);

			const newTransactionPayload = {
				description: 'Grocery Shopping',
				amount: 50,
				fromAccountId: account.id,
				type: 'expense',
				date: new Date().toISOString(),
				categoryId: categoryExpense.id,
			} as const;

			const {data: transaction} = await createTransaction(
				newTransactionPayload,
				user,
			);
			const transactionCategoryLinkBefore = await db
				.selectFrom('transaction_category')
				.where('transaction_id', '=', transaction.id)
				.selectAll()
				.execute();

			expect(transactionCategoryLinkBefore).toHaveLength(1);

			await deleteTransaction(transaction.id, user);

			const transactionCategoryLinkAfter = await db
				.selectFrom('transaction_category')
				.where('transaction_id', '=', transaction.id)
				.selectAll()
				.execute();

			expect(transactionCategoryLinkAfter).toHaveLength(0);
		});

		test('deletes transaction', async () => {
			const {data: transactionBefore} = await getTransaction(
				transaction.id,
				user,
			);
			expect(transactionBefore).toBeDefined();

			const {status, body} = await deleteTransaction(transaction.id, user);

			expect(status).toEqual(200);
			expect(body.status).toEqual('success');
			expect(body.data).toEqual(
				`Transaction with id ${transaction.id} deleted`,
			);

			const {data: transactionAfter} = await getTransaction(
				transaction.id,
				user,
			);
			expect(transactionAfter).toBeUndefined();
		});

		test('returns 404 when trying to delete non-existing account', async () => {
			const id = 'c2b8f3ee-c9ae-4104-8f89-173e3871ebb9';
			const {status, body} = await deleteTransaction(id, user);

			expect(status).toEqual(404);
			expect(body.status).toEqual('error');
			if ('message' in body) {
				expect(body.message).toEqual(`Transaction with id ${id} not found`);
			}
		});

		test('returns validation error if id is not a valid uuid', async () => {
			const {status, body} = await deleteTransaction(
				'some-non-existing-id',
				user,
			);
			expect(status).toEqual(400);
			expect(body.status).toEqual('error');
			if ('message' in body) {
				expect(body.message).toEqual('Invalid id format');
			}
		});

		describe('Account Balance Updates', () => {
			let account1: FinancialAccountDto;
			let account2: FinancialAccountDto;
			let transactionExpense: TransactionDto;
			let transactionIncome: TransactionDto;
			let transactionTransfer: TransactionDto;

			beforeEach(async () => {
				const responseAcc1 = await createFinancialAccount(
					{
						name: 'Account 1',
						initialBalance: 1000,
						type: 'bank',
					},
					user,
				);
				account1 = responseAcc1.data;

				const responseAcc2 = await createFinancialAccount(
					{
						name: 'Account 1',
						initialBalance: 1000,
						type: 'bank',
					},
					user,
				);
				account2 = responseAcc2.data;

				const newTransactionPayload = {
					description: 'Grocery Shopping',
					amount: 100,
					date: new Date().toISOString(),
				} as const;

				const responseExpense = await createTransaction(
					{
						...newTransactionPayload,
						fromAccountId: account1.id,
						type: 'expense',
					},
					user,
				);
				transactionExpense = responseExpense.data;

				const responseIncome = await createTransaction(
					{
						...newTransactionPayload,
						toAccountId: account2.id,
						type: 'income',
					},
					user,
				);
				transactionIncome = responseIncome.data;

				const responseTransfer = await createTransaction(
					{
						...newTransactionPayload,
						fromAccountId: account1.id,
						toAccountId: account2.id,
						type: 'transfer',
					},
					user,
				);
				transactionTransfer = responseTransfer.data;
			});

			test('updates account balance correctly for deleted income transaction', async () => {
				const accountBalanceBefore = await getFinancialAccountBalances(
					account2.id,
				);

				await deleteTransaction(transactionIncome.id, user);

				const accountBalanceAfter = await getFinancialAccountBalances(
					account2.id,
				);

				expect(accountBalanceAfter.balance).toEqual(
					accountBalanceBefore.balance - transactionIncome.amount,
				);
			});

			test('updates account balance correctly for deleted expense transaction', async () => {
				const accountBalanceBefore = await getFinancialAccountBalances(
					account1.id,
				);

				await deleteTransaction(transactionExpense.id, user);

				const accountBalanceAfter = await getFinancialAccountBalances(
					account1.id,
				);

				expect(accountBalanceAfter?.balance).toEqual(
					accountBalanceBefore.balance + transactionExpense.amount,
				);
			});

			test('updates account balances correctly for deleted transfer transaction', async () => {
				const account1BalanceBefore = await getFinancialAccountBalances(
					account1.id,
				);
				const account2BalanceBefore = await getFinancialAccountBalances(
					account2.id,
				);

				await deleteTransaction(transactionTransfer.id, user);

				const account1BalanceAfter = await getFinancialAccountBalances(
					account1.id,
				);
				const account2BalanceAfter = await getFinancialAccountBalances(
					account2.id,
				);

				expect(account1BalanceAfter?.balance).toEqual(
					account1BalanceBefore.balance + transactionTransfer.amount,
				);
				expect(account2BalanceAfter?.balance).toEqual(
					account2BalanceBefore.balance - transactionTransfer.amount,
				);
			});
		});
	});
});
