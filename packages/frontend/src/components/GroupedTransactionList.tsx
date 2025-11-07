import { DateTime } from 'luxon'
import type { TransactionDto } from '@pinkka/schemas/transaction-dto'
import type { FC } from 'react'
import { TransactionList } from '@/components/TransactionList'
import { DateService } from '@/services/date-service'

type Props = {
  transactions: Array<TransactionDto>
}

export const GroupedTransactionList: FC<Props> = ({ transactions }) => {
  const groupedTransactions = Object.groupBy(
    transactions,
    ({ date }) => DateTime.fromISO(date).toISODate()!,
  )

  return (
    <div className="grid gap-4">
      {Object.entries(groupedTransactions).map(([date, trxs]) => {
        if (!trxs || trxs.length === 0) return null

        const isToday = DateTime.fromISO(date).hasSame(DateTime.local(), 'day')
        const isYesterday = DateTime.fromISO(date).hasSame(
          DateTime.local().minus({ days: 1 }),
          'day',
        )

        const label = isToday
          ? 'Today'
          : isYesterday
            ? 'Yesterday'
            : DateService.formatDate({
                date,
                format: 'MONTH_DAY_LONG',
              })

        return <TransactionList key={label} label={label} transactions={trxs} />
      })}
    </div>
  )
}
