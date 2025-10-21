import type {
  Category,
  CategoryUpdate,
  NewCategory,
} from "@/types/Category.js";
import type {
  CategoryDto,
  NewCategoryDto,
  UpdateCategoryDto,
} from "@pinkka/schemas/CategoryDto.js";

export const categoryMapper = {
  fromDb(db: Category): CategoryDto {
    return {
      id: db.id,
      user_id: db.user_id,
      type: db.type,
      name: db.name,
      is_deleted: db.is_deleted,
      created_at: db.created_at.toISOString(),
      updated_at: db.updated_at.toISOString(),
    };
  },
  newDtoToDb(dto: NewCategoryDto, user_id: string): NewCategory {
    return {
      type: dto.type,
      name: dto.name,
      is_deleted: false,
      user_id,
    };
  },
  updateDtoToDb(dto: Partial<UpdateCategoryDto>): Partial<CategoryUpdate> {
    return {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.is_deleted !== undefined && { is_deleted: dto.is_deleted }),
    };
  },
};
