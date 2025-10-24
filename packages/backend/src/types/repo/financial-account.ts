import type {BaseRepoOptions} from '@/types/db/base-repo-options.js';
import type {
	FinancialAccountUpdate,
	NewFinancialAccount,
} from '@/types/db/financial-account.js';

export type CreateFinancialAccountRepoParameters = {
	data: NewFinancialAccount;
} & BaseRepoOptions;

export type FindOneFinancialAccountRepoParameters = {
	id: string;
	userId: string;
} & BaseRepoOptions;

export type GetAllFinancialAccountRepoParameters = {
	userId: string;
} & BaseRepoOptions;

export type UpdateFinancialAccountRepoParameters = {
	id: string;
	userId: string;
	data: FinancialAccountUpdate;
} & BaseRepoOptions;

export type DeleteFinancialAccountRepoParameters = {
	id: string;
	userId: string;
} & BaseRepoOptions;

export type FindTransactionsFinancialAccountRepoParameters = {
	id: string;
	userId: string;
} & BaseRepoOptions;

export type IncrementBalanceRepoParameters = {
	id: string;
	userId: string;
	amount: number;
} & BaseRepoOptions;

export type DecrementBalanceRepoParameters = {
	id: string;
	userId: string;
	amount: number;
} & BaseRepoOptions;
