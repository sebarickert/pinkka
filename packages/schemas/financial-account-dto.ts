import * as z from 'zod';

export const financialAccountTypesSchema = z.enum([
	'bank',
	'credit_card',
	'wallet',
	'investment',
	'loan',
]);

export const FinancialAccountDtoSchema = z.strictObject({
	id: z.uuid(),
	userId: z.uuid(),
	name: z.string(),
	type: financialAccountTypesSchema,
	initialBalance: z.number(),
	balance: z.number(),
	isDeleted: z.boolean().default(false),
	createdAt: z.iso.datetime({offset: true}),
	updatedAt: z.iso.datetime({offset: true}),
});

export const NewFinancialAccountDtoSchema = FinancialAccountDtoSchema.omit({
	id: true,
	userId: true,
	createdAt: true,
	updatedAt: true,
	balance: true,
	isDeleted: true,
});

export const UpdateFinancialAccountDtoSchema = FinancialAccountDtoSchema.omit({
	id: true,
	userId: true,
	createdAt: true,
	updatedAt: true,
	balance: true,
}).partial();

export type FinancialAccountDto = z.infer<typeof FinancialAccountDtoSchema>;
export type NewFinancialAccountDto = z.infer<
	typeof NewFinancialAccountDtoSchema
>;
export type UpdateFinancialAccountDto = z.infer<
	typeof UpdateFinancialAccountDtoSchema
>;
