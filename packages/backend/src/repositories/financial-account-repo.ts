import type {Transaction} from 'kysely';
import {db} from '@/lib/db.js';
import type {Database} from '@/types/db/database.js';
import type {
	FinancialAccount,
	FinancialAccountUpdate,
	NewFinancialAccount,
} from '@/types/db/financial-account.js';

// TODO: Move to a shared location
export type BaseQueryOptions = {
	sortBy?: string; // Default sorting field
	order?: 'asc' | 'desc'; // Default order
	limit?: number; // Pagination
	offset?: number; // Pagination
	includeDeleted?: boolean; // Whether to include soft-deleted records
	trx?: Transaction<Database>; // Transaction object
};

type CreateFinancialAccountParameters = {
	data: NewFinancialAccount;
} & BaseQueryOptions;

export async function create({
	data,
}: CreateFinancialAccountParameters): Promise<FinancialAccount> {
	return db
		.insertInto('financial_account')
		.values(data)
		.returningAll()
		.executeTakeFirstOrThrow();
}

type CreateManyFinancialAccountParameters = {
	data: NewFinancialAccount[];
} & BaseQueryOptions;

export async function createMany({
	data,
}: CreateManyFinancialAccountParameters): Promise<FinancialAccount[]> {
	return db
		.insertInto('financial_account')
		.values(data)
		.returningAll()
		.execute();
}

type FindOneFinancialAccountParameters = {
	id: string;
	userId: string;
} & BaseQueryOptions;

export async function findOne({
	id,
	userId,
}: FindOneFinancialAccountParameters): Promise<FinancialAccount | undefined> {
	return db
		.selectFrom('financial_account')
		.where('id', '=', id)
		.where('user_id', '=', userId)
		.selectAll()
		.executeTakeFirst();
}

type FindManyFinancialAccountParameters = {
	userId: string;
} & BaseQueryOptions;

export async function findMany({
	userId,
}: FindManyFinancialAccountParameters): Promise<FinancialAccount[]> {
	return db
		.selectFrom('financial_account')
		.where('user_id', '=', userId)
		.where('is_deleted', '=', false)
		.selectAll()
		.execute();
}

type UpdateFinancialAccountParameters = {
	id: string;
	userId: string;
	data: FinancialAccountUpdate;
} & BaseQueryOptions;

export async function update({
	id,
	userId,
	data,
}: UpdateFinancialAccountParameters): Promise<FinancialAccount> {
	return db
		.updateTable('financial_account')
		.where('id', '=', id)
		.where('user_id', '=', userId)
		.set(data)
		.returningAll()
		.executeTakeFirstOrThrow();
}

type FindTransactionsFinancialAccountParameters = {
	id: string;
	userId: string;
} & BaseQueryOptions;

export async function findTransactionsForTransactionAccount({
	id,
	userId,
}: FindTransactionsFinancialAccountParameters) {
	return db
		.selectFrom('transaction')
		.where(({eb, or}) =>
			or([eb('from_account_id', '=', id), eb('to_account_id', '=', id)]),
		)
		.where('user_id', '=', userId)
		.selectAll()
		.execute();
}

export async function getAccountBalance(id: string): Promise<number> {
	const result = await db
		.selectFrom('financial_account')
		.where('id', '=', id)
		.select('balance')
		.executeTakeFirst();

	return Number(result?.balance) || 0;
}

type IncrementBalanceParameters = {
	id: string;
	amount: number;
} & BaseQueryOptions;

export async function incrementBalance({
	id,
	amount,
	trx,
}: IncrementBalanceParameters) {
	return (trx ?? db)
		.updateTable('financial_account')
		.set((eb) => ({balance: eb('balance', '+', amount)}))
		.where('id', '=', id)
		.execute();
}

type DecrementBalanceParameters = {
	id: string;
	amount: number;
} & BaseQueryOptions;

export async function decrementBalance({
	id,
	amount,
	trx,
}: DecrementBalanceParameters) {
	return (trx ?? db)
		.updateTable('financial_account')
		.set((eb) => ({balance: eb('balance', '-', amount)}))
		.where('id', '=', id)
		.execute();
}
