import * as z from "zod";
import { transactionTypeSchema } from "./transaction-dto.js";

export const CategoryDtoSchema = z.strictObject({
  id: z.uuid(),
  userId: z.uuid(),
  name: z.string(),
  type: transactionTypeSchema,
  isDeleted: z.boolean().default(false),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});

export const NewCategoryDtoSchema = CategoryDtoSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  isDeleted: true,
});

export const UpdateCategoryDtoSchema = CategoryDtoSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type CategoryDto = z.infer<typeof CategoryDtoSchema>;
export type NewCategoryDto = z.infer<typeof NewCategoryDtoSchema>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategoryDtoSchema>;
