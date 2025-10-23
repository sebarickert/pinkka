import type {NewTransactionDto} from '@pinkka/schemas/TransactionDto.js';
import type {UserWithSessionToken} from '@test-utils/create-test-user.js';
import {fetcher} from '@test-utils/fetcher.js';
import {expect} from 'vitest';
import type {Transaction} from '@/types/db/Transaction.js';
import {db} from '@/lib/db.js';

export async function createTransaction(
	newTransactionPayload: NewTransactionDto,
	user: UserWithSessionToken,
): Promise<Transaction> {
	const res = await fetcher(
		'/api/transactions',
		{
			method: 'POST',
			body: JSON.stringify(newTransactionPayload),
		},
		user.session_token,
	);

	const body = await res.json();

	expect(res.status).toEqual(201);
	expect(body.status).toEqual('success');

	return body.data;
}

export async function getTransactionCategoryLinks(transactionId: string) {
	return db
		.selectFrom('transaction_category')
		.where('transaction_id', '=', transactionId)
		.selectAll()
		.execute();
}

export async function updateTransaction(id: string, body: any, token: string) {
	const res = await fetcher(
		`/api/transactions/${id}`,
		{
			method: 'PUT',
			body: body ? JSON.stringify(body) : undefined,
		},
		token,
	);
	const json = await res.json();
	return {status: res.status, body: json};
}

export async function getTransaction(id: string) {
	return db
		.selectFrom('transaction')
		.where('id', '=', id)
		.selectAll()
		.executeTakeFirst();
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
