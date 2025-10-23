import * as z from 'zod';

const validateIncomeTransaction = (data: any) => {
	if (data.type === 'income') {
		return Boolean(data.toAccountId) && !data.fromAccountId;
	}

	return true;
};

const validateExpenseTransaction = (data: any) => {
	if (data.type === 'expense') {
		return Boolean(data.fromAccountId) && !data.toAccountId;
	}

	return true;
};

const validateTransferTransaction = (data: any) => {
	if (data.type === 'transfer') {
		return (
			Boolean(data.toAccountId) &&
			Boolean(data.fromAccountId) &&
			data.toAccountId !== data.fromAccountId
		);
	}

	return true;
};

export const transactionTypeSchema = z.enum(['income', 'expense', 'transfer']);

export const TransactionDtoSchema = z
	.strictObject({
		id: z.uuid(),
		userId: z.uuid(),
		toAccountId: z.uuid().nullable().optional(),
		fromAccountId: z.uuid().nullable().optional(),
		type: transactionTypeSchema,
		amount: z.coerce.number().min(0),
		description: z.string().max(255),
		date: z.iso.datetime({offset: true}),
		createdAt: z.iso.datetime({offset: true}),
		updatedAt: z.iso.datetime({offset: true}),
	})
	.refine(validateIncomeTransaction, {
		error: 'Not allowed for income transaction',
		path: ['fromAccountId'],
	})
	.refine(validateExpenseTransaction, {
		error: 'Not allowed for expense transaction',
		path: ['toAccountId'],
	})
	.refine(validateTransferTransaction, {
		error: 'Not allowed to have same account id as fromAccountId',
		path: ['toAccountId'],
	})
	.refine(validateTransferTransaction, {
		error: 'Not allowed to have same account id as toAccountId',
		path: ['fromAccountId'],
	});

export const NewTransactionDtoSchema = TransactionDtoSchema.omit({
	id: true,
	userId: true,
	createdAt: true,
	updatedAt: true,
})
	.safeExtend({categoryId: z.uuid().nullable().optional()})
	.refine(validateIncomeTransaction, {
		message: 'Not allowed for income transaction',
		path: ['fromAccountId'],
	})
	.refine(validateExpenseTransaction, {
		message: 'Not allowed for expense transaction',
		path: ['toAccountId'],
	})
	.refine(validateTransferTransaction, {
		message: 'Not allowed to have same account id as fromAccountId',
		path: ['toAccountId'],
	})
	.refine(validateTransferTransaction, {
		message: 'Not allowed to have same account id as toAccountId',
		path: ['fromAccountId'],
	});

export const UpdateTransactionDtoSchema = TransactionDtoSchema.omit({
	id: true,
	userId: true,
	createdAt: true,
	updatedAt: true,
	type: true,
})
	.partial()
	.safeExtend({categoryId: z.uuid().nullable().optional()});

export const TransactionWithCategoryDtoSchema = TransactionDtoSchema.safeExtend(
	{
		category: z
			.object({
				id: z.uuid(),
				name: z.string(),
			})
			.optional(),
	},
);

export type TransactionDto = z.infer<typeof TransactionDtoSchema>;
export type NewTransactionDto = z.infer<typeof NewTransactionDtoSchema>;
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionDtoSchema>;
export type TransactionWithCategoryDto = z.infer<
	typeof TransactionWithCategoryDtoSchema
>;
