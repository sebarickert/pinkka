import * as TransactionRepo from '@/repositories/transaction-repo.js';
import * as TransactionCategoryRepo from '@/repositories/transaction-category-repo.js';
import type {
	NewTransaction,
	Transaction,
	TransactionUpdate,
} from '@/types/db/transaction.js';
import {db} from '@/lib/db.js';
import {updateAccountBalancesForTransaction} from '@/services/financial-accounts.js';

export async function createTransaction({
	data,
	category_id,
}: {
	data: NewTransaction;
	category_id: string | null | undefined;
}): Promise<Transaction> {
	return db.transaction().execute(async (trx) => {
		const transaction = await TransactionRepo.createOne({
			data,
			trx,
		});

		if (category_id) {
			await TransactionCategoryRepo.create({
				data: {category_id, transaction_id: transaction.id},
				trx,
			});
		}

		await updateAccountBalancesForTransaction({
			amount: Number(transaction.amount),
			transaction,
			trx,
		});

		return transaction;
	});
}

export async function updateTransaction({
	data,
	category_id,
	transaction,
}: {
	data: TransactionUpdate;
	category_id?: string | null;
	transaction: Transaction;
}): Promise<Transaction> {
	return db.transaction().execute(async (trx) => {
		let updatedTransaction = transaction;

		const hasFieldsToUpdate = Object.keys(data).length > 0;

		if (hasFieldsToUpdate) {
			updatedTransaction = await TransactionRepo.update({
				id: transaction.id,
				user_id: transaction.user_id,
				data,
				trx,
			});
		}

		if (typeof category_id === 'string') {
			await TransactionCategoryRepo.upsert({
				data: {transaction_id: transaction.id, category_id},
				trx,
			});
		}

		if (category_id === null) {
			await TransactionCategoryRepo.deleteLink({
				data: {transaction_id: transaction.id},
				trx,
			});
		}

		if (data.amount) {
			const currentAmount = Number(transaction.amount);
			const newAmount = Number(updatedTransaction.amount);
			const amountDifference = newAmount - currentAmount;

			await updateAccountBalancesForTransaction({
				amount: amountDifference,
				transaction,
				trx,
			});
		}

		return updatedTransaction;
	});
}

export async function deleteTransaction({
	id,
	user_id,
	transaction,
}: {
	id: string;
	user_id: string;
	transaction: Transaction;
}): Promise<boolean> {
	return db.transaction().execute(async (trx) => {
		await TransactionRepo.deleteTransaction({
			id,
			user_id,
			trx,
		});

		await updateAccountBalancesForTransaction({
			amount: -Number(transaction.amount),
			transaction,
			trx,
		});

		return true;
	});
}
