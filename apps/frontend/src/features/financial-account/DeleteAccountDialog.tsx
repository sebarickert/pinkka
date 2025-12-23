import { Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { FC } from 'react'
import type { FinancialAccountDto } from '@pinkka/schemas/financial-account-dto'
import { Button } from '@/components/Button'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { cn } from '@/lib/utils'
import { financialAccountKeys } from '@/queries/financial-accounts'
import { FinancialAccountService } from '@/services/financial-account-service'

type Props = {
  account: FinancialAccountDto
}

export const DeleteAccountDialog: FC<Props> = ({ account }) => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: FinancialAccountService.delete,
    onError: (err) => setError(err.message),
    onSuccess: () => {
      queryClient.setQueryData(financialAccountKeys.all, (oldData) =>
        (oldData as Array<FinancialAccountDto> | undefined)?.filter(
          ({ id }) => id !== account.id,
        ),
      )
      navigate({ to: '/app/home' })
    },
  })

  const handleSubmit = async () => {
    await mutation.mutateAsync(account.id)
    setOpen(false)
  }

  return (
    <ResponsiveDialog
      open={open}
      setOpen={setOpen}
      title="Confirm Account Deletion"
      description="Are you sure you want to delete this account? This action cannot be undone."
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
            {mutation.isPending ? 'Deleting Account...' : 'Delete Account'}
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
