import { ArrowDown, ArrowDownUp, ArrowUp } from 'lucide-react'
import type { FC } from 'react'
import type { TransactionDto } from '@pinkka/schemas/transaction-dto'
import { formatCurrency } from '@/utils/format-currency'
import { List } from '@/components/List'
import { DateService } from '@/services/date-service'
import { cn } from '@/lib/utils'

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
    <div className={cn('p-4 gap-4 bg-layer flex items-center')}>
      <div className="relative">
        <span className="shrink-0">{getTransactionIcon(transaction.type)}</span>
        <span
          className={cn(
            'size-2 rounded-full inline-block absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2',
            transaction.type === 'income' && 'bg-green',
            transaction.type === 'expense' && 'bg-red',
            transaction.type === 'transfer' && 'bg-blue',
          )}
          aria-hidden="true"
        />
      </div>
      <span className="sr-only">{`Transaction type ${transaction.type}`}</span>
      <div className="grid text-sm">
        <span className="truncate">{transaction.description}</span>
        <time
          dateTime={transaction.date}
          className="text-muted-foreground truncate"
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
