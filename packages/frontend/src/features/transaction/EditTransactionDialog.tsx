import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { DateTime } from 'luxon'
import type { FC } from 'react'
import type {
  TransactionDto,
  UpdateTransactionDto,
} from '@pinkka/schemas/transaction-dto'
import type { TransactionFormSchema } from '@/features/transaction/TransactionForm'
import { Button } from '@/components/Button'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { TransactionService } from '@/services/transaction-service'
import {
  transactionByIdDetailsQueryOptions,
  transactionKeys,
} from '@/queries/transactions'
import { TransactionForm } from '@/features/transaction/TransactionForm'
import { financialAccountKeys } from '@/queries/financial-accounts'
import { categoryKeys } from '@/queries/categories'

type Props = {
  transaction: TransactionDto
}

export const EditTransactionDialog: FC<Props> = ({ transaction }) => {
  const { data: transactionDetails } = useQuery({
    ...transactionByIdDetailsQueryOptions(transaction.id),
  })
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: transactionKeys.all })
    queryClient.invalidateQueries({ queryKey: financialAccountKeys.all })
    queryClient.invalidateQueries({ queryKey: categoryKeys.all })

    setOpen(false)
  }

  const handleMutation = (data: TransactionFormSchema) => {
    const updatedTransaction = {
      date: DateTime.fromISO(data.date).toISO()?.toString(),
      amount: data.amount,
      description: data.description,
      ...('fromAccountId' in data ? { fromAccountId: data.fromAccountId } : {}),
      ...('toAccountId' in data ? { toAccountId: data.toAccountId } : {}),
      // @todo: Implement when backend returns categories via transaction dto
      // ...('categoryId' in data ? { fromAccountId: data.categoryId } : {}),
    } satisfies UpdateTransactionDto

    return TransactionService.update({
      id: transaction.id,
      data: updatedTransaction,
    })
  }

  return (
    <ResponsiveDialog
      open={open}
      setOpen={setOpen}
      title="Update Transaction Details"
      description="Edit the details for this transaction. Type can not be changed."
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
      <TransactionForm
        transaction={transactionDetails}
        mutationFn={handleMutation}
        onSuccess={handleSuccess}
      />
    </ResponsiveDialog>
  )
}
