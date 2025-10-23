import type {
	FinancialAccountDto,
	NewFinancialAccountDto,
	UpdateFinancialAccountDto,
} from '@pinkka/schemas/FinancialAccountDto.js';
import type {
	FinancialAccount,
	FinancialAccountUpdate,
	NewFinancialAccount,
} from '@/types/db/FinancialAccount.js';

export const financialAccountMapper = {
	fromDb(db: FinancialAccount): FinancialAccountDto {
		return {
			id: db.id,
			user_id: db.user_id,
			type: db.type,
			name: db.name,
			currency: db.currency as FinancialAccountDto['currency'],
			initial_balance: Number(Number(db.initial_balance).toFixed(2)),
			balance: Number(Number(db.balance).toFixed(2)),
			is_deleted: db.is_deleted,
			created_at: db.created_at.toISOString(),
			updated_at: db.updated_at.toISOString(),
		};
	},
	newDtoToDb(
		dto: NewFinancialAccountDto,
		user_id: string,
	): NewFinancialAccount {
		return {
			type: dto.type,
			name: dto.name,
			currency: dto.currency,
			initial_balance: dto.initial_balance,
			balance: dto.initial_balance,
			is_deleted: false,
			user_id,
		};
	},
	updateDtoToDb(dto: Partial<UpdateFinancialAccountDto>): Partial<FinancialAccountUpdate> {
		return {
			...(dto.type !== undefined && {type: dto.type}),
			...(dto.name !== undefined && {name: dto.name}),
			...(dto.currency !== undefined && {currency: dto.currency}),
			...(dto.initial_balance !== undefined && {
				initial_balance: dto.initial_balance,
			}),
			...(dto.is_deleted !== undefined && {is_deleted: dto.is_deleted}),
		};
	},
};
