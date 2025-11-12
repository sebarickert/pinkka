import { useState } from 'react'
import type { FC } from 'react'
import type { TransactionDto } from '@pinkka/schemas/transaction-dto'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { TransactionListItem } from '@/features/transaction/TransactionListItem'
import { TransactionDetails } from '@/features/transaction/TransactionDetails'
import { DeleteTransactionDialog } from '@/features/transaction/DeleteTransactionDialog'
import { EditTransactionDialog } from '@/features/transaction/EditTransactionDialog'

type Props = {
  transaction: TransactionDto
}

export const TransactionDialog: FC<Props> = ({ transaction }) => {
  const [open, setOpen] = useState(false)

  return (
    <ResponsiveDialog
      open={open}
      setOpen={setOpen}
      title="Transaction Details"
      trigger={<TransactionListItem transaction={transaction} />}
    >
      <div className="flex flex-col gap-8">
        <TransactionDetails transaction={transaction} />
        <div className="grid gap-4">
          <EditTransactionDialog transaction={transaction} />
          <DeleteTransactionDialog
            transaction={transaction}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </div>
    </ResponsiveDialog>
  )
}
