import type {Transaction as KyselyTransaction} from 'kysely';
import * as FinancialAccountRepo from '@/repositories/financial-account-repo.js';
import type {Database} from '@/types/db/database.js';
import type {Transaction} from '@/types/db/transaction.js';

export async function updateAccountBalancesForTransaction({
	amount,
	transaction,
	trx,
}: {
	amount: number;
	transaction: Transaction;
	trx?: KyselyTransaction<Database>;
}): Promise<void> {
	if (transaction.type === 'income' && transaction.to_account_id) {
		await FinancialAccountRepo.incrementBalance({
			id: transaction.to_account_id,
			amount,
			trx,
		});
	}

	if (transaction.type === 'expense' && transaction.from_account_id) {
		await FinancialAccountRepo.decrementBalance({
			id: transaction.from_account_id,
			amount,
			trx,
		});
	}

	if (
		transaction.type === 'transfer'
		&& transaction.from_account_id
		&& transaction.to_account_id
	) {
		await FinancialAccountRepo.decrementBalance({
			id: transaction.from_account_id,
			amount,
			trx,
		});
		await FinancialAccountRepo.incrementBalance({
			id: transaction.to_account_id,
			amount,
			trx,
		});
	}
}
