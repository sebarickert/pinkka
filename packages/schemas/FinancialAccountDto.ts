import * as z from "zod";

export const financialAccountTypes = z.enum([
  "bank",
  "credit_card",
  "wallet",
  "investment",
  "loan",
]);

export const currencyEnum = z.enum(["EUR", "USD", "GBP"]);
export type Currency = z.infer<typeof currencyEnum>;

export const FinancialAccountDto = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  name: z.string(),
  type: financialAccountTypes,
  currency: currencyEnum,
  current_balance: z.number(),
  pending_balance: z.number(),
  is_deleted: z.boolean().default(false),
  created_at: z.iso.datetime({ offset: true }),
  updated_at: z.iso.datetime({ offset: true }),
});

export const NewFinancialAccountDto = FinancialAccountDto.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type FinancialAccountDto = z.infer<typeof FinancialAccountDto>;
export type NewFinancialAccountDto = z.infer<typeof NewFinancialAccountDto>;
