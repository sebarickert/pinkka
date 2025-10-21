import * as z from "zod";

const validateIncomeTransaction = (data: any) => {
  if (data.type === "income") {
    return !!data.to_account_id && !data.from_account_id;
  }

  return true;
};

const validateExpenseTransaction = (data: any) => {
  if (data.type === "expense") {
    return !!data.from_account_id && !data.to_account_id;
  }

  return true;
};

const validateTransferTransaction = (data: any) => {
  if (data.type === "transfer") {
    return (
      !!data.to_account_id &&
      !!data.from_account_id &&
      data.to_account_id !== data.from_account_id
    );
  }

  return true;
};

export const transactionType = z.enum(["income", "expense", "transfer"]);

export const TransactionDto = z
  .object({
    id: z.uuid(),
    user_id: z.uuid(),
    to_account_id: z.uuid().nullable().optional(),
    from_account_id: z.uuid().nullable().optional(),
    type: transactionType,
    amount: z.coerce.number().min(0),
    description: z.string().max(255),
    date: z.iso.datetime({ offset: true }),
    created_at: z.iso.datetime({ offset: true }),
    updated_at: z.iso.datetime({ offset: true }),
  })
  .strict()
  .refine(validateIncomeTransaction, {
    message: "Not allowed for income transaction",
    path: ["from_account_id"],
  })
  .refine(validateTransferTransaction, {
    message: "Not allowed to have same account id as from_account_id",
    path: ["to_account_id"],
  })
  .refine(validateTransferTransaction, {
    message: "Not allowed to have same account id as to_account_id",
    path: ["from_account_id"],
  });

export const NewTransactionDto = TransactionDto.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
})
  .safeExtend({ category_id: z.uuid().nullable().optional() })
  .refine(validateIncomeTransaction, {
    message: "Not allowed for income transaction",
    path: ["from_account_id"],
  })
  .refine(validateExpenseTransaction, {
    message: "Not allowed for expense transaction",
    path: ["to_account_id"],
  })
  .refine(validateTransferTransaction, {
    message: "Not allowed to have same account id as from_account_id",
    path: ["to_account_id"],
  })
  .refine(validateTransferTransaction, {
    message: "Not allowed to have same account id as to_account_id",
    path: ["from_account_id"],
  });

export const UpdateTransactionDto = TransactionDto.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
  type: true,
})
  .partial()
  .safeExtend({ category_id: z.uuid().nullable().optional() });

export const TransactionWithCategoryDto = TransactionDto.safeExtend({
  category: z
    .object({
      id: z.uuid(),
      name: z.string(),
    })
    .optional(),
});

export type TransactionDto = z.infer<typeof TransactionDto>;
export type NewTransactionDto = z.infer<typeof NewTransactionDto>;
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionDto>;
export type TransactionWithCategoryDto = z.infer<
  typeof TransactionWithCategoryDto
>;
