import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, X } from 'lucide-react'
import type { FC } from 'react'
import type { CategoryDto } from '@pinkka/schemas/category-dto'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { CategoryService } from '@/services/category-service'
import { categoryKeys } from '@/queries/categories'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'

type Props = {
  categoryId: string
}

export const DeleteCategoryDialog: FC<Props> = ({ categoryId }) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: CategoryService.delete,
    onError: (err) => setError(err.message),
    onSuccess: () => {
      queryClient.setQueryData(categoryKeys.lists(), (oldData) =>
        (oldData as Array<CategoryDto> | undefined)?.filter(
          ({ id }) => id !== categoryId,
        ),
      )
    },
  })

  const handleSubmit = async () => {
    await mutation.mutateAsync(categoryId)
    setOpen(false)
  }

  return (
    <ResponsiveDialog
      open={open}
      setOpen={setOpen}
      title="Confirm Category Deletion"
      description="Are you sure you want to delete this category? This action cannot be undone."
      trigger={
        <Button
          type="button"
          accentColor="ghost"
          size="icon"
          aria-label="Delete"
        >
          <X className="size-5" />
        </Button>
      }
    >
      <div className="flex flex-col gap-4 *:w-full mt-2">
        <div aria-live="polite">
          {error && (
            <div className="bg-layer mb-4 text-sm p-4 text-center border rounded-md">
              <span>{error}</span>
            </div>
          )}
        </div>
        <Button
          type="button"
          accentColor="danger"
          size="large"
          onClick={handleSubmit}
          disabled={mutation.isPending}
        >
          {mutation.isPending && <Loader2 className="animate-spin" />}
          <span className={cn(mutation.isPending && 'sr-only')}>
            {mutation.isPending ? 'Deleting Category...' : 'Delete Category'}
          </span>
        </Button>
        <Button
          type="button"
          accentColor="secondary"
          onClick={() => setOpen(false)}
          size="large"
          disabled={mutation.isPending}
        >
          Cancel
        </Button>
      </div>
    </ResponsiveDialog>
  )
}
