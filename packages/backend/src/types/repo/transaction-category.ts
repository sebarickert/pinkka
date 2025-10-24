import type {BaseRepoOptions} from '@/types/db/base-repo-options.js';
import type {
	NewTransactionCategory,
	TransactionCategory,
} from '@/types/db/transaction-category.js';

export type CreateTransactionCategoryParameters = {
	data: NewTransactionCategory;
} & BaseRepoOptions;

export type UpsertTransactionCategoryParameters = {
	data: TransactionCategory;
} & BaseRepoOptions;

export type DeleteTransactionCategoryParameters = {
	transaction_id: string;
} & BaseRepoOptions;
