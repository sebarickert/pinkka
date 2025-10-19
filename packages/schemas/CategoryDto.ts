import * as z from "zod";
import { transactionType } from "./TransactionDto.js";

export const CategoryDto = z
  .object({
    id: z.uuid(),
    user_id: z.uuid(),
    name: z.string(),
    type: transactionType,
    is_deleted: z.boolean().optional().default(false),
    created_at: z.iso.datetime({ offset: true }),
    updated_at: z.iso.datetime({ offset: true }),
  })
  .strict();

export const NewCategoryDto = CategoryDto.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateCategoryDto = CategoryDto.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
}).partial();

export type CategoryDto = z.infer<typeof CategoryDto>;
export type NewCategoryDto = z.infer<typeof NewCategoryDto>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategoryDto>;
