import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useState } from 'react'
import type { FC } from 'react'
import type {
  FinancialAccountDto,
  UpdateFinancialAccountDto,
} from '@pinkka/schemas/financial-account-dto'
import type { AccountFormSchema } from '@/features/financial-account/AccountForm'
import { Button } from '@/components/Button'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import {
  accountHasTransactionsQueryOptions,
  financialAccountKeys,
} from '@/queries/financial-accounts'
import { FinancialAccountService } from '@/services/financial-account-service'
import { AccountForm } from '@/features/financial-account/AccountForm'

type Props = {
  account: FinancialAccountDto
}

export const EditAccountDialog: FC<Props> = ({ account }) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const { data: hasTransactions } = useSuspenseQuery(
    accountHasTransactionsQueryOptions(account.id),
  )

  const mutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateFinancialAccountDto
    }) => FinancialAccountService.update(id, payload),
    onSuccess: (updatedAccount) => {
      queryClient.setQueryData(
        financialAccountKeys.byId(account.id),
        updatedAccount,
      )

      setOpen(false)
    },
  })

  const handleSubmit = async (payload: AccountFormSchema) => {
    const data = {
      name: payload.name,
      type: payload.type,
      ...(hasTransactions ? {} : { initialBalance: payload.balance }),
    }

    await mutation.mutateAsync({ id: account.id, payload: data })
  }

  return (
    <ResponsiveDialog
      open={open}
      setOpen={setOpen}
      title="Update Account Details"
      description="Edit the details for this account. Some fields may be disabled if there are existing transactions."
      trigger={
        <Button
          type="button"
          accentColor="secondary"
          className="w-full"
          size="large"
        >
          Edit
        </Button>
      }
    >
      <AccountForm
        account={account}
        onSubmit={handleSubmit}
        hasTransactions={Boolean(hasTransactions)}
      />
    </ResponsiveDialog>
  )
}
