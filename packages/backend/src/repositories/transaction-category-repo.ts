import type {Transaction} from 'kysely';
import {db} from '@/lib/db.js';
import type {BaseQueryOptions} from '@/repositories/financial-account-repo.js';
import type {Database} from '@/types/db/database.js';
import type {
	NewTransactionCategory,
	TransactionCategory,
} from '@/types/db/transaction-category.js';

type CreateTransactionCategoryParameters = {
	data: NewTransactionCategory;
} & BaseQueryOptions;

export async function create({
	data,
	trx,
}: CreateTransactionCategoryParameters): Promise<TransactionCategory> {
	return (trx ?? db)
		.insertInto('transaction_category')
		.values(data)
		.returningAll()
		.executeTakeFirstOrThrow();
}

type UpsertTransactionCategoryParameters = {
	data: TransactionCategory;
} & BaseQueryOptions;

export async function upsert({
	data,
	trx,
}: UpsertTransactionCategoryParameters): Promise<TransactionCategory> {
	await (trx ?? db)
		.deleteFrom('transaction_category')
		.where('transaction_id', '=', data.transaction_id)
		.execute();

	// Insert the new link
	return db
		.insertInto('transaction_category')
		.values(data)
		.returningAll()
		.executeTakeFirstOrThrow();
}

export async function deleteLink({
	data: {transaction_id},
	trx,
}: {
	data: {
		transaction_id: string;
	};
	trx?: Transaction<Database>;
}) {
	return (trx ?? db)
		.deleteFrom('transaction_category')
		.where('transaction_id', '=', transaction_id)
		.execute();
}
