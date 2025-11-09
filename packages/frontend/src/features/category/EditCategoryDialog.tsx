import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Settings } from 'lucide-react'
import type { FC } from 'react'
import type { CategoryDto } from '@pinkka/schemas/category-dto'
import type { CategoryFormSchema } from '@/features/category/CategoryForm'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { CategoryForm } from '@/features/category/CategoryForm'
import { CategoryService } from '@/services/category-service'
import {
  categoryHasTransactionsQueryOptions,
  categoryKeys,
} from '@/queries/categories'
import { Button } from '@/components/Button'

type Props = {
  category: CategoryDto
}

export const EditCategoryDialog: FC<Props> = ({ category }) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const {
    data: hasTransactions,
    isLoading,
    isFetching,
  } = useQuery(categoryHasTransactionsQueryOptions(category.id))

  const isLoadingTransactionLinks = isLoading || isFetching

  const handleSuccess = (updatedCategory: CategoryDto) => {
    queryClient.setQueryData(
      categoryKeys.lists(),
      (old: Array<CategoryDto> = []) =>
        old
          .map((existingCategory) =>
            existingCategory.id === updatedCategory.id
              ? updatedCategory
              : existingCategory,
          )
          .toSorted((a, b) => a.name.localeCompare(b.name)),
    )

    setOpen(false)
  }

  const handleMutation = async (data: CategoryFormSchema) => {
    const updatedCategory = {
      name: data.name,
      ...(hasTransactions ? {} : { type: data.type }),
    }

    return CategoryService.update({ id: category.id, data: updatedCategory })
  }

  return (
    <ResponsiveDialog
      open={open}
      setOpen={setOpen}
      title="Update Category Details"
      description="Edit the details for this category. Some fields may be disabled if there are existing transactions."
      trigger={
        <Button type="button" accentColor="ghost" size="icon" aria-label="Edit">
          <Settings className="size-5" />
        </Button>
      }
    >
      <CategoryForm
        category={category}
        onSuccess={handleSuccess}
        mutationFn={handleMutation}
        hasTransactions={Boolean(hasTransactions)}
        isLoadingTransactionLinks={isLoadingTransactionLinks}
      />
    </ResponsiveDialog>
  )
}
