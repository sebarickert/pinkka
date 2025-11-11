import type { TransactionDto } from '@pinkka/schemas/transaction-dto'
import type { FC } from 'react'
import { cn } from '@/lib/utils'
import { DateService } from '@/services/date-service'
import { formatCurrency } from '@/utils/format-currency'
import { getAmountAbbreviation, getTransactionIcon } from '@/utils/transaction'

type Props = {
  transaction: TransactionDto
}

export const TransactionListItem: FC<Props> = ({ transaction, ...rest }) => {
  const abbreviation = getAmountAbbreviation(transaction.type)

  return (
    <button
      // Pass in drawer/dialog props
      {...rest}
      type="button"
      className={cn(
        'grid grid-cols-[auto_1fr_auto] items-center gap-4',
        'xl:pr-2 w-full text-left',
        'focus-visible:focus-highlight hover:bg-layer hover:cursor-pointer',
        'group',
      )}
      aria-label={`Open details for transaction ${transaction.description}`}
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
    </button>
  )
}
