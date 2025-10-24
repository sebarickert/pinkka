import type {
	NewTransactionDto,
	UpdateTransactionDto,
} from '@pinkka/schemas/transaction-dto.js';
import type {BaseServiceOptions} from '@/types/db/base-repo-options.js';
import type {Transaction} from '@/types/db/transaction.js';

export type CreateTransactionServiceParameters = {
	data: NewTransactionDto;
	userId: string;
} & BaseServiceOptions;

export type UpdateTransactionServiceParameters = {
	data: UpdateTransactionDto;
	transaction: Transaction;
} & BaseServiceOptions;

export type DeleteTransactionServiceParameters = {
	id: string;
	userId: string;
	transaction: Transaction;
} & BaseServiceOptions;
