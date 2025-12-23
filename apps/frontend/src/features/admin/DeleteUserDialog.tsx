import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Loader2, X } from 'lucide-react'
import type { FC } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'

type Props = {
  userId: string
}

export const DeleteUserDialog: FC<Props> = ({ userId }) => {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => authClient.admin.removeUser({ userId }),
    onError: (err) => setError(err.message),
  })

  const handleSubmit = async () => {
    await mutation.mutateAsync()
    setOpen(false)
  }

  return (
    <ResponsiveDialog
      open={open}
      setOpen={setOpen}
      title="Confirm User Deletion"
      description="Are you sure you want to delete this user? This action cannot be undone."
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
            {mutation.isPending ? 'Deleting User...' : 'Delete User'}
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
