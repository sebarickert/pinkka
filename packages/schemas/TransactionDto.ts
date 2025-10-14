import * as z from "zod";

export const transactionType = z.enum(["income", "expense", "transfer"]);

export const TransactionDto = z
  .object({
    id: z.uuid(),
    user_id: z.uuid(),
    to_account_id: z.uuid().optional(),
    from_account_id: z.uuid().optional(),
    type: transactionType,
    amount: z.coerce.number().min(0),
    description: z.string().max(255),
    date: z.coerce.date(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
    is_deleted: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      if (data.type === "income") {
        return !!data.to_account_id && !data.from_account_id;
      }

      if (data.type === "expense") {
        return !!data.from_account_id && !data.to_account_id;
      }

      if (data.type === "transfer") {
        return (
          !!data.to_account_id &&
          !!data.from_account_id &&
          data.to_account_id !== data.from_account_id
        );
      }
      return false;
    },
    {
      message: "Invalid accounts for transaction type",
      path: [], // can add path if you want to highlight a field
    }
  );

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
