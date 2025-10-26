import * as z from 'zod';

const AccountTypeEnumSchema = z.enum([
	'SAVINGS',
	'LOAN',
	'CREDIT',
	'CASH',
	'INVESTMENT',
	'LOAN',
	'PRE_ASSIGNED_CASH',
	'LONG_TERM_SAVINGS',
]);

export type AccountTypeEnum = z.infer<typeof AccountTypeEnumSchema>;

const TransactionCategoryVisibilityTypeEnumSchema = z.enum([
	'EXPENSE',
	'INCOME',
	'TRANSFER',
]);

const UserSchema = z.unknown();

const AccountSchema = z.object({
	createdAt: z.string(),
	updatedAt: z.string(),
	id: z.string(),
	name: z.string(),
	type: AccountTypeEnumSchema,
	balance: z.string(),
	currentDateBalance: z.string().nullable(),
	userId: z.string(),
	isDeleted: z.boolean(),
});

const AccountBalanceChangeSchema = z.object({
	createdAt: z.string(),
	updatedAt: z.string(),
	id: z.string(),
	date: z.string(),
	amount: z.string(),
	userId: z.string(),
	accountId: z.string(),
});

const TransactionSchema = z.object({
	createdAt: z.string(),
	updatedAt: z.string(),
	id: z.string(),
	amount: z.string(),
	description: z.string(),
	date: z.string(),
	userId: z.string(),
	fromAccount: z.string().nullable(),
	toAccount: z.string().nullable(),
});

const TransactionCategorySchema = z.object({
	createdAt: z.string(),
	updatedAt: z.string(),
	id: z.string(),
	userId: z.string(),
	name: z.string(),
	visibility: z.array(TransactionCategoryVisibilityTypeEnumSchema),
	deleted: z.boolean(),
	parentCategoryId: z.string().nullable(),
});

const TransactionCategoryMappingSchema = z.object({
	createdAt: z.string(),
	updatedAt: z.string(),
	id: z.string(),
	userId: z.string(),
	description: z.string().nullable(),
	categoryId: z.string(),
	transactionId: z.string(),
	amount: z.string(),
});

const UserPreferenceSchema = z.object({
	createdAt: z.string(),
	updatedAt: z.string(),
	id: z.string(),
	userId: z.string(),
	key: z.string(),
	value: z.string(),
});

const TransactionTemplateSchema = z.object({
	createdAt: z.string(),
	updatedAt: z.string(),
	id: z.string(),
	templateName: z.string(),
	templateType: z.array(z.string()),
	templateVisibility: z.string(),
	amount: z.string().nullable(),
	description: z.string(),
	dayOfMonth: z.number().nullable(),
	dayOfMonthToCreate: z.number().nullable(),
	userId: z.string(),
	fromAccount: z.string().nullable(),
	toAccount: z.string().nullable(),
	categories: z.array(z.string()),
});

const TransactionTemplateLogSchema = z.object({
	id: z.string(),
	userId: z.string(),
	eventType: z.string(),
	transactionId: z.string(),
	templateId: z.string(),
	executed: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const FinancerMigrationDataSchema = z.object({
	user: UserSchema,
	accounts: z.array(AccountSchema),
	accountBalanceChanges: z.array(AccountBalanceChangeSchema),
	transactions: z.array(TransactionSchema),
	transactionCategories: z.array(TransactionCategorySchema),
	transactionCategoryMappings: z.array(TransactionCategoryMappingSchema),
	userPreferences: z.array(UserPreferenceSchema),
	transactionTemplates: z.array(TransactionTemplateSchema),
	transactionTemplateLogs: z.array(TransactionTemplateLogSchema),
});

export type FinancerMigrationData = z.infer<typeof FinancerMigrationDataSchema>;
