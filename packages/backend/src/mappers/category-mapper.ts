import type {
  CategoryDto,
  NewCategoryDto,
  UpdateCategoryDto,
} from "@pinkka/schemas/category-dto.js";
import type {
  Category,
  CategoryUpdate,
  NewCategory,
} from "@/types/db/category.js";

export const CategoryMapper = {
  fromDb(db: Category): CategoryDto {
    return {
      id: db.id,
      userId: db.user_id,
      type: db.type,
      name: db.name,
      isDeleted: db.is_deleted,
      createdAt: db.created_at.toISOString(),
      updatedAt: db.updated_at.toISOString(),
    };
  },
  newDtoToDb(dto: NewCategoryDto, userId: string): NewCategory {
    return {
      type: dto.type,
      name: dto.name,
      is_deleted: false,
      user_id: userId,
    };
  },
  updateDtoToDb(dto: Partial<UpdateCategoryDto>): Partial<CategoryUpdate> {
    return {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.isDeleted !== undefined && { is_deleted: dto.isDeleted }),
    };
  },
};
