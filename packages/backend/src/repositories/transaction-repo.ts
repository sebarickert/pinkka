import {db} from '@/lib/db.js';
import type {BaseQueryOptions} from '@/repositories/financial-account-repo.js';
import type {
	Transaction,
	TransactionUpdate,
	NewTransaction,
} from '@/types/db/transaction.js';

type CreateOneTransactionParameters = {
	data: NewTransaction;
} & BaseQueryOptions;

export async function createOne({
	data,
	trx,
}: CreateOneTransactionParameters): Promise<Transaction> {
	return (trx ?? db)
		.insertInto('transaction')
		.values(data)
		.returningAll()
		.executeTakeFirstOrThrow();
}

type FindOneTransactionParameters = {
	id: string;
	user_id: string;
} & BaseQueryOptions;

export async function findOne({
	id,
	user_id,
}: FindOneTransactionParameters): Promise<Transaction | undefined> {
	return db
		.selectFrom('transaction')
		.where('id', '=', id)
		.where('user_id', '=', user_id)
		.selectAll()
		.executeTakeFirst();
}

type FindManyTransactionParameters = {
	user_id: string;
} & BaseQueryOptions;

export async function findMany({
	user_id,
}: FindManyTransactionParameters): Promise<Transaction[]> {
	return db
		.selectFrom('transaction')
		.where('user_id', '=', user_id)
		.selectAll()
		.execute();
}

type UpdateTransactionParameters = {
	id: string;
	user_id: string;
	data: TransactionUpdate;
} & BaseQueryOptions;

export async function update({
	id,
	user_id,
	data,
	trx,
}: UpdateTransactionParameters): Promise<Transaction> {
	return (trx ?? db)
		.updateTable('transaction')
		.where('id', '=', id)
		.where('user_id', '=', user_id)
		.set(data)
		.returningAll()
		.executeTakeFirstOrThrow();
}

type DeleteTransactionParameters = {
	id: string;
	user_id: string;
} & BaseQueryOptions;

export async function deleteTransaction({
	id,
	user_id,
	trx,
}: DeleteTransactionParameters) {
	return (trx ?? db)
		.deleteFrom('transaction')
		.where('id', '=', id)
		.where('user_id', '=', user_id)
		.execute();
}
