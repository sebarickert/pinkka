import { queryOptions } from '@tanstack/react-query'
import { CategoryService } from '@/services/category-service'

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  byCategory: (categoryId: string) =>
    [...categoryKeys.lists(), categoryId] as const,
}

export const getAllCategoriesOptions = queryOptions({
  queryKey: categoryKeys.lists(),
  queryFn: CategoryService.getAll,
})
