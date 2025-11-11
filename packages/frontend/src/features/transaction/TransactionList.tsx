import type { FC } from 'react'
import type { TransactionDto } from '@pinkka/schemas/transaction-dto'
import { List } from '@/components/List'
import { TransactionDialog } from '@/features/transaction/TransactionDialog'

type Props = {
  label?: string
  transactions: Array<TransactionDto>
}

export const TransactionList: FC<Props> = ({ label, transactions }) => {
  return (
    <List label={label}>
      {transactions.map((transaction) => (
        <TransactionDialog transaction={transaction} />
      ))}
    </List>
  )
}
