import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import type { FC } from 'react'
import type { CategoryDto } from '@pinkka/schemas/category-dto'
import type { CategoryFormSchema } from '@/features/category/CategoryForm'
import { Button } from '@/components/Button'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { CategoryForm } from '@/features/category/CategoryForm'
import { CategoryService } from '@/services/category-service'
import { categoryKeys } from '@/queries/categories'

export const CreateCategoryDialog: FC = () => {
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
      trigger={
        <Button type="button" accentColor="ghost">
          <Plus />
          Create
        </Button>
      }
    >
      <CategoryForm onSuccess={handleSuccess} mutationFn={handleMutation} />
    </ResponsiveDialog>
  )
}
