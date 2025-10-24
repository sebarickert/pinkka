import {type Transaction as KyselyTransaction} from 'kysely';
import type {BaseServiceOptions} from '@/types/db/base-repo-options.js';
import type {Transaction} from '@/types/db/transaction.js';
import type {Database} from '@/types/db/database.js';

export type UpdateAccountBalancesForTransactionServiceParameters = {
	transaction: Transaction;
	amount: number;
	trx?: KyselyTransaction<Database>;
} & BaseServiceOptions;
