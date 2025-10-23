import type {
	Generated,
	GeneratedAlways,
	Insertable,
	Selectable,
	Updateable,
} from 'kysely';
import type {Timestamp} from '@/types/db/database.js';

export type TransactionTable = {
	id: GeneratedAlways<string>;
	user_id: string;
	to_account_id: string | null;
	from_account_id: string | null;
	type: 'income' | 'expense' | 'transfer';
	amount: number;
	description: string;
	date: Timestamp;
	created_at: Generated<Date>;
	updated_at: Generated<Date>;
};

export type Transaction = Selectable<TransactionTable>;
export type NewTransaction = Insertable<TransactionTable>;
export type TransactionUpdate = Updateable<TransactionTable>;
