import * as z from "zod";

export const transactionTypes = z.enum(["income", "expense", "transfer"]);

export const CategoryDto = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  name: z.string(),
  type: transactionTypes,
  is_deleted: z.boolean().default(false),
  created_at: z.iso.datetime({ offset: true }),
  updated_at: z.iso.datetime({ offset: true }),
});

export const NewCategoryDto = CategoryDto.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
  is_deleted: true,
}).strict();

export const UpdateCategoryDto = CategoryDto.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
})
  .strict()
  .partial();

export type CategoryDto = z.infer<typeof CategoryDto>;
export type NewCategoryDto = z.infer<typeof NewCategoryDto>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategoryDto>;
