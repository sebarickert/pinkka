import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { DateTime } from 'luxon'
import type { FC } from 'react'
import type { FinancialAccountDto } from '@pinkka/schemas/financial-account-dto'
import type { UpdateMarketValueFormSchema } from '@/features/financial-account/UpdateMarketValueForm'
import type { NewTransactionDto } from '@pinkka/schemas/transaction-dto'
import { Button } from '@/components/Button'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { financialAccountKeys } from '@/queries/financial-accounts'
import { UpdateMarketValueForm } from '@/features/financial-account/UpdateMarketValueForm'
import { TransactionService } from '@/services/transaction-service'
import { transactionKeys } from '@/queries/transactions'
import { categoryKeys } from '@/queries/categories'

type Props = {
  account: FinancialAccountDto
}

export const UpdateMarketValueDialog: FC<Props> = ({ account }) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: transactionKeys.all })
    queryClient.invalidateQueries({ queryKey: financialAccountKeys.all })
    queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    setOpen(false)
  }

  const handleMutation = (data: UpdateMarketValueFormSchema) => {
    const isPositiveChange = data.currentMarketValue > account.balance
    const amountChange = Math.abs(data.currentMarketValue - account.balance)
    const date = DateTime.fromISO(data.date).toISO()?.toString()

    if (!date) {
      throw new Error('Invalid date format')
    }

    const newTransaction = {
      date,
      type: isPositiveChange ? 'income' : 'expense',
      amount: amountChange,
      description: 'Market Value Adjustment',
      ...(isPositiveChange
        ? { toAccountId: account.id, fromAccountId: null }
        : { fromAccountId: account.id, toAccountId: null }),
    } satisfies NewTransactionDto

    return TransactionService.create(newTransaction)
  }

  return (
    <ResponsiveDialog
      open={open}
      setOpen={setOpen}
      title="Update Account Market Value"
      description="Set the current market value of your investment account. This will update the account balance accordingly."
      trigger={
        <Button
          type="button"
          accentColor="secondary"
          className="w-full"
          size="large"
        >
          Update Market Value
        </Button>
      }
    >
      <UpdateMarketValueForm
        currentBalance={account.balance}
        onSuccess={handleSuccess}
        mutationFn={handleMutation}
      />
    </ResponsiveDialog>
  )
}
