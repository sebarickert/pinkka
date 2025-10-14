import * as z from "zod";

export const transactionType = z.enum(["income", "expense", "transfer"]);

export const TransactionDto = z
  .object({
    id: z.uuid(),
    user_id: z.uuid(),
    to_account_id: z.uuid().nullable(),
    from_account_id: z.uuid().nullable(),
    type: transactionType,
    amount: z.number().min(0),
    description: z.string().max(255),
    date: z.iso.datetime({ offset: true }),
    created_at: z.iso.datetime({ offset: true }),
    updated_at: z.iso.datetime({ offset: true }),
    is_deleted: z.boolean().optional().default(false),
  })
  .refine((data) => data.to_account_id || data.from_account_id, {
    message: "Either to_account_id or from_account_id must be provided",
    path: [],
  });

export const NewTransactionDto = TransactionDto.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
})
  .safeExtend({ category_id: z.uuid().optional() })
  .strict();

export const UpdateTransactionDto = TransactionDto.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
  type: true,
})
  .strict()
  .partial()
  .safeExtend({ category_id: z.uuid().optional() });

export const TransactionWithCategoryDto = TransactionDto.safeExtend({
  category: z
    .object({
      id: z.uuid(),
      name: z.string(),
    })
    .nullable(),
});

export type TransactionDto = z.infer<typeof TransactionDto>;
export type NewTransactionDto = z.infer<typeof NewTransactionDto>;
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionDto>;
export type TransactionWithCategoryDto = z.infer<
  typeof TransactionWithCategoryDto
>;
