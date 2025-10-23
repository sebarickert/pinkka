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
	userId: string;
} & BaseQueryOptions;

export async function findOne({
	id,
	userId,
}: FindOneTransactionParameters): Promise<Transaction | undefined> {
	return db
		.selectFrom('transaction')
		.where('id', '=', id)
		.where('user_id', '=', userId)
		.selectAll()
		.executeTakeFirst();
}

type FindManyTransactionParameters = {
	userId: string;
} & BaseQueryOptions;

export async function findMany({
	userId,
}: FindManyTransactionParameters): Promise<Transaction[]> {
	return db
		.selectFrom('transaction')
		.where('user_id', '=', userId)
		.selectAll()
		.execute();
}

type UpdateTransactionParameters = {
	id: string;
	userId: string;
	data: TransactionUpdate;
} & BaseQueryOptions;

export async function update({
	id,
	userId,
	data,
	trx,
}: UpdateTransactionParameters): Promise<Transaction> {
	return (trx ?? db)
		.updateTable('transaction')
		.where('id', '=', id)
		.where('user_id', '=', userId)
		.set(data)
		.returningAll()
		.executeTakeFirstOrThrow();
}

type DeleteTransactionParameters = {
	id: string;
	userId: string;
} & BaseQueryOptions;

export async function deleteTransaction({
	id,
	userId,
	trx,
}: DeleteTransactionParameters) {
	return (trx ?? db)
		.deleteFrom('transaction')
		.where('id', '=', id)
		.where('user_id', '=', userId)
		.execute();
}
