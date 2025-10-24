import type {TransactionDto} from '@pinkka/schemas/transaction-dto.js';
import {TransactionRepo} from '@/repositories/transaction-repo.js';
import {TransactionCategoryRepo} from '@/repositories/transaction-category-repo.js';
import {db} from '@/lib/db.js';
import {FinancialAccountService} from '@/services/financial-account-service.js';
import type {
	CreateTransactionServiceParameters,
	DeleteTransactionServiceParameters,
	UpdateTransactionServiceParameters,
} from '@/types/service/transaction.js';
import {TransactionMapper} from '@/mappers/transaction-mapper.js';

export const TransactionService = {
	async create(
		parameters: CreateTransactionServiceParameters,
	): Promise<TransactionDto> {
		const {categoryId, ...newTransaction} = parameters.data;

		const transaction = await db.transaction().execute(async (trx) => {
			const transaction = await TransactionRepo.create({
				data: TransactionMapper.newDtoToDb(newTransaction, parameters.userId),
				trx,
			});

			if (categoryId) {
				await TransactionCategoryRepo.create({
					data: {
						category_id: categoryId,
						transaction_id: transaction.id,
					},
					trx,
				});
			}

			await FinancialAccountService.updateAccountBalancesForTransaction({
				amount: Number(transaction.amount),
				transaction,
				trx,
			});

			return transaction;
		});

		return TransactionMapper.fromDb(transaction);
	},
	async update(
		parameters: UpdateTransactionServiceParameters,
	): Promise<TransactionDto> {
		const {categoryId, ...updatedTransactionFields} = parameters.data;

		const transaction = await db.transaction().execute(async (trx) => {
			const {transaction} = parameters;
			let updatedTransaction = transaction;

			const hasFieldsToUpdate =
				Object.keys(updatedTransactionFields).length > 0;

			if (hasFieldsToUpdate) {
				updatedTransaction = await TransactionRepo.update({
					id: transaction.id,
					userId: transaction.user_id,
					data: TransactionMapper.updateDtoToDb(updatedTransactionFields),
					trx,
				});
			}

			// If a categoryId is provided, upsert the category association
			if (typeof categoryId === 'string') {
				await TransactionCategoryRepo.upsert({
					data: {transaction_id: transaction.id, category_id: categoryId},
					trx,
				});
			}

			// If categoryId is null, delete the existing category association
			if (categoryId === null) {
				await TransactionCategoryRepo.delete({
					transaction_id: transaction.id,
					trx,
				});
			}

			// Adjust account balances if the amount has changed
			if (updatedTransaction.amount) {
				const currentAmount = Number(transaction.amount);
				const newAmount = Number(updatedTransaction.amount);
				const amountDifference = newAmount - currentAmount;

				await FinancialAccountService.updateAccountBalancesForTransaction({
					amount: amountDifference,
					transaction,
					trx,
				});
			}

			return updatedTransaction;
		});

		return TransactionMapper.fromDb(transaction);
	},
	async delete(
		parameters: DeleteTransactionServiceParameters,
	): Promise<boolean> {
		const {id, userId, transaction} = parameters;

		return db.transaction().execute(async (trx) => {
			await TransactionRepo.delete({
				id,
				userId,
				trx,
			});

			// Revert account balances affected by the deleted transaction
			await FinancialAccountService.updateAccountBalancesForTransaction({
				amount: -Number(transaction.amount),
				transaction,
				trx,
			});

			return true;
		});
	},
};
