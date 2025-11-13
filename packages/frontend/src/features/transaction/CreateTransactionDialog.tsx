import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { DateTime } from 'luxon'

import type { FC } from 'react'
import type { NewTransactionDto } from '@pinkka/schemas/transaction-dto'
import type { TransactionFormSchema } from '@/features/transaction/TransactionForm'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { TransactionService } from '@/services/transaction-service'
import { transactionKeys } from '@/queries/transactions'
import { TransactionForm } from '@/features/transaction/TransactionForm'
import { financialAccountKeys } from '@/queries/financial-accounts'
import { categoryKeys } from '@/queries/categories'

type Props = {
  children: React.ReactNode
}

export const CreateTransactionDialog: FC<Props> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: transactionKeys.all })
    queryClient.invalidateQueries({ queryKey: financialAccountKeys.all })
    queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    setOpen(false)
  }

  const handleMutation = (data: TransactionFormSchema) => {
    const isIncome = 'toAccountId' in data && !('fromAccountId' in data)
    const isExpense = 'fromAccountId' in data && !('toAccountId' in data)

    const type = isExpense ? 'expense' : isIncome ? 'income' : 'transfer'

    const date = DateTime.fromISO(data.date).toISO()?.toString()

    if (!date) {
      throw new Error('Invalid date format')
    }

    const newTransaction = {
      date,
      type,
      amount: data.amount,
      description: data.description,
      ...('fromAccountId' in data
        ? { fromAccountId: data.fromAccountId }
        : { fromAccountId: null }),
      ...('toAccountId' in data
        ? { toAccountId: data.toAccountId }
        : { toAccountId: null }),
      // @todo: Implement when backend returns categories via transaction dto
      // ...('categoryId' in data ? { fromAccountId: data.categoryId } : {}),
    } satisfies NewTransactionDto

    return TransactionService.create(newTransaction)
  }

  return (
    <ResponsiveDialog
      open={open}
      setOpen={setOpen}
      title="Create New Transaction"
      description="Fill in the details below to create a new transaction."
      trigger={children}
    >
      <TransactionForm mutationFn={handleMutation} onSuccess={handleSuccess} />
    </ResponsiveDialog>
  )
}
