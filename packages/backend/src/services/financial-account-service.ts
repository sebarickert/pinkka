import {FinancialAccountRepo} from '@/repositories/financial-account-repo.js';
import type {UpdateAccountBalancesForTransactionServiceParameters} from '@/types/service/financial-account.js';

export const FinancialAccountService = {
	async updateAccountBalancesForTransaction(
		parameters: UpdateAccountBalancesForTransactionServiceParameters,
	) {
		const {transaction, amount, trx} = parameters;

		if (transaction.type === 'income' && transaction.to_account_id) {
			await FinancialAccountRepo.incrementBalance({
				id: transaction.to_account_id,
				userId: transaction.user_id,
				amount,
				trx,
			});
		}

		if (transaction.type === 'expense' && transaction.from_account_id) {
			await FinancialAccountRepo.decrementBalance({
				id: transaction.from_account_id,
				userId: transaction.user_id,
				amount,
				trx,
			});
		}

		if (
			transaction.type === 'transfer' &&
			transaction.from_account_id &&
			transaction.to_account_id
		) {
			await Promise.all([
				FinancialAccountRepo.decrementBalance({
					id: transaction.from_account_id,
					userId: transaction.user_id,
					amount,
					trx,
				}),
				FinancialAccountRepo.incrementBalance({
					id: transaction.to_account_id,
					userId: transaction.user_id,
					amount,
					trx,
				}),
			]);
		}
	},
};
