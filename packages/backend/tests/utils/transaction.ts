import {
	type NewTransactionDto,
	type TransactionDto,
	type UpdateTransactionDto,
} from '@pinkka/schemas/transaction-dto.js';
import {expect} from 'vitest';
import type {JsonResponse} from '@pinkka/schemas/json-response.js';
import type {UserWithSessionToken} from '@/test-utils/create-test-user.js';
import {fetcher} from '@/test-utils/fetcher.js';
import {db} from '@/lib/db.js';

export async function getTransaction(
	id: string,
	user: UserWithSessionToken,
): Promise<{
	status: number;
	body: JsonResponse<TransactionDto>;
	data: TransactionDto;
}> {
	const response = await fetcher(
		`/api/transactions/${id}`,
		{},
		user.sessionToken,
	);

	const body = (await response.json()) as JsonResponse<TransactionDto>;

	return {status: response.status, body, data: body.data as TransactionDto};
}

export async function getTransactions(user: UserWithSessionToken): Promise<{
	status: number;
	body: JsonResponse<TransactionDto[]>;
	data: TransactionDto[];
}> {
	const response = await fetcher(`/api/transactions`, {}, user.sessionToken);

	const body = (await response.json()) as JsonResponse<TransactionDto[]>;

	return {status: response.status, body, data: body.data as TransactionDto[]};
}

export async function createTransaction(
	newTransactionPayload: NewTransactionDto | undefined,
	user: UserWithSessionToken,
): Promise<{status: number; body: JsonResponse; data: TransactionDto}> {
	const response = await fetcher(
		'/api/transactions',
		{
			method: 'POST',
			body: JSON.stringify(newTransactionPayload),
		},
		user.sessionToken,
	);

	const body = (await response.json()) as JsonResponse<TransactionDto>;

	return {status: response.status, body, data: body.data as TransactionDto};
}

export async function getTransactionCategoryLinks(transactionId: string) {
	return db
		.selectFrom('transaction_category')
		.where('transaction_id', '=', transactionId)
		.selectAll()
		.execute();
}

export async function updateTransaction(
	id: string,
	updateTransactionPayload: Partial<UpdateTransactionDto> | undefined,
	user: UserWithSessionToken,
): Promise<{
	status: number;
	body: JsonResponse<TransactionDto>;
	data: TransactionDto;
}> {
	const response = await fetcher(
		`/api/transactions/${id}`,
		{
			method: 'PUT',
			body: JSON.stringify(updateTransactionPayload),
		},
		user.sessionToken,
	);

	const body = (await response.json()) as JsonResponse<TransactionDto>;

	return {status: response.status, body, data: body.data as TransactionDto};
}

export async function deleteTransaction(
	id: string,
	user: UserWithSessionToken,
): Promise<{
	status: number;
	body: JsonResponse;
	data: TransactionDto;
}> {
	const response = await fetcher(
		`/api/transactions/${id}`,
		{
			method: 'DELETE',
		},
		user.sessionToken,
	);

	const body = (await response.json()) as JsonResponse<TransactionDto>;

	return {status: response.status, body, data: body.data as TransactionDto};
}

export async function expectCategoryLink(
	transactionId: string,
	expectedCategoryId: string | null,
) {
	const links = await getTransactionCategoryLinks(transactionId);
	if (expectedCategoryId) {
		expect(links).toHaveLength(1);
		expect(links[0].category_id).toEqual(expectedCategoryId);
	} else {
		expect(links).toHaveLength(0);
	}
}
