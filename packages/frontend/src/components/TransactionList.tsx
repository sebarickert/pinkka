import { ArrowDown, ArrowDownUp, ArrowUp } from 'lucide-react'
import type { FC } from 'react'
import type { TransactionDto } from '@pinkka/schemas/transaction-dto'
import { formatCurrency } from '@/utils/format-currency'
import { DateService } from '@/services/date-service'
import { cn } from '@/lib/utils'
import { List } from '@/components/List'

type Props = {
  label?: string
  transactions: Array<TransactionDto>
}

export const TransactionList: FC<Props> = ({ label, transactions }) => {
  return (
    <List label={label}>
      {transactions.map((transaction) => (
        <TransactionListItem transaction={transaction} />
      ))}
    </List>
  )
}

const getAmountAbbreviation = (type: TransactionDto['type']) => {
  switch (type) {
    case 'income':
      return '+'
    case 'expense':
      return '-'
    default:
      return ''
  }
}

const getTransactionIcon = (type: TransactionDto['type']) => {
  switch (type) {
    case 'income':
      return <ArrowDown />
    case 'expense':
      return <ArrowUp />
    case 'transfer':
    default:
      return <ArrowDownUp />
  }
}

const TransactionListItem: FC<{ transaction: TransactionDto }> = ({
  transaction,
}) => {
  const abbreviation = getAmountAbbreviation(transaction.type)

  return (
    <div
      className={cn(
        'grid grid-cols-[auto_1fr_auto] items-center gap-4 pr-2',
        'hover:bg-layer',
        'group',
      )}
    >
      <div
        className={cn(
          'size-14 inline-flex items-center justify-center bg-layer',
          'group-hover:bg-accent relative',
          'before:absolute before:inset-0',
          '[&>svg]:relative',
          transaction.type === 'income' && 'before:bg-green/15',
          transaction.type === 'expense' && 'before:bg-red/15',
          transaction.type === 'transfer' && 'before:bg-blue/15',
        )}
      >
        {getTransactionIcon(transaction.type)}
      </div>
      <span className="sr-only">{`Transaction type ${transaction.type}`}</span>
      <div className="grid">
        <span className="text-sm truncate">{transaction.description}</span>
        <time
          dateTime={transaction.date}
          className="text-muted-foreground text-xs truncate"
        >
          {DateService.formatDate({
            date: transaction.date,
            format: 'DAY_MONTH_YEAR_LONG',
          })}
        </time>
      </div>
      <span className="ml-auto font-medium">
        <span className="sr-only">Transaction amount</span>
        <span>{`${abbreviation}${formatCurrency(transaction.amount)}`}</span>
      </span>
    </div>
  )
}
