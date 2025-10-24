import type {
	Generated,
	GeneratedAlways,
	Insertable,
	Selectable,
	Updateable,
} from 'kysely';

// Named FinancialAccount to avoid confusion with Account from better-auth
export type FinancialAccountTable = {
	id: GeneratedAlways<string>;
	user_id: string;
	name: string;
	type: 'bank' | 'credit_card' | 'wallet' | 'investment' | 'loan';
	initial_balance: number;
	balance: number;
	is_deleted: boolean;
	created_at: Generated<Date>;
	updated_at: Generated<Date>;
};

export type FinancialAccount = Selectable<FinancialAccountTable>;
export type NewFinancialAccount = Insertable<FinancialAccountTable>;
export type FinancialAccountUpdate = Updateable<FinancialAccountTable>;
