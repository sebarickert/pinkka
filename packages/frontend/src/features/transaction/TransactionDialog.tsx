import { useState } from 'react'
import type { FC } from 'react'
import type { TransactionDto } from '@pinkka/schemas/transaction-dto'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { TransactionListItem } from '@/features/transaction/TransactionListItem'
import { TransactionDetails } from '@/features/transaction/TransactionDetails'

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
      <TransactionDetails transaction={transaction} />
    </ResponsiveDialog>
  )
}
