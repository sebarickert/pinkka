import { Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { FC } from 'react'
import type { TransactionDto } from '@pinkka/schemas/transaction-dto'
import { Button } from '@/components/Button'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { cn } from '@/lib/utils'
import { TransactionService } from '@/services/transaction-service'
import { transactionKeys } from '@/queries/transactions'
import { financialAccountKeys } from '@/queries/financial-accounts'
import { categoryKeys } from '@/queries/categories'

type Props = {
  transaction: TransactionDto
  onSuccess: () => void
}

export const DeleteTransactionDialog: FC<Props> = ({
  transaction,
  onSuccess,
}) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: TransactionService.delete,
    onError: (err) => setError(err.message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      queryClient.invalidateQueries({ queryKey: financialAccountKeys.all })
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      onSuccess()
    },
  })

  const handleSubmit = async () => {
    await mutation.mutateAsync(transaction.id)
    setOpen(false)
  }

  return (
    <ResponsiveDialog
      open={open}
      setOpen={setOpen}
      title="Confirm Transaction Deletion"
      description="Are you sure you want to delete this transaction? This action cannot be undone."
      trigger={
        <Button
          type="button"
          accentColor="secondary"
          className="w-full"
          size="large"
        >
          Delete
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
            {mutation.isPending
              ? 'Deleting Transaction...'
              : 'Delete Transaction'}
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
