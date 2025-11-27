import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { FC } from 'react'
import type { CategoryDto } from '@pinkka/schemas/category-dto'
import type { CategoryFormSchema } from '@/features/category/CategoryForm'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { CategoryForm } from '@/features/category/CategoryForm'
import { CategoryService } from '@/services/category-service'
import { categoryKeys } from '@/queries/categories'

type Props = {
  children: React.ReactNode
}
export const CreateCategoryDialog: FC<Props> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const handleSuccess = (newCategory: CategoryDto) => {
    queryClient.setQueryData(
      categoryKeys.lists(),
      (old: Array<CategoryDto> = []) => [...old, newCategory],
    )
    setOpen(false)
  }

  const handleMutation = async (data: CategoryFormSchema) => {
    const newCategory = {
      name: data.name,
      type: data.type,
    }

    return CategoryService.create(newCategory)
  }

  return (
    <ResponsiveDialog
      open={open}
      setOpen={setOpen}
      title="Create New Category"
      description="Fill in the details below to create a new category."
      trigger={children}
    >
      <CategoryForm onSuccess={handleSuccess} mutationFn={handleMutation} />
    </ResponsiveDialog>
  )
}
