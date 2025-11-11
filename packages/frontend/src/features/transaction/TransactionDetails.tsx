import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import type { FC } from 'react'
import type { TransactionDto } from '@pinkka/schemas/transaction-dto'
import { DetailsList } from '@/components/DetailsList'
import { transactionByIdDetailsQueryOptions } from '@/queries/transactions'
import { formatCurrency } from '@/utils/format-currency'
import { TRANSACTION_TYPE_LABEL_MAPPING } from '@/utils/transaction'
import { DateService } from '@/services/date-service'
import { cn } from '@/lib/utils'

type Props = {
  transaction: TransactionDto
}

export const TransactionDetails: FC<Props> = ({ transaction }) => {
  const { data, isLoading, isFetching } = useQuery({
    ...transactionByIdDetailsQueryOptions(transaction.id),
  })

  if (isLoading || isFetching) {
    return (
      <div
        className={cn(
          'flex justify-center items-center',
          transaction.type === 'transfer' ? 'min-h-56' : 'min-h-[184px]',
        )}
      >
        <span className="sr-only">Loading...</span>
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  if (!data) {
    return <div>No data found</div>
  }

  const details = [
    {
      label: 'Type',
      description: TRANSACTION_TYPE_LABEL_MAPPING[data.type],
    },
    {
      label: 'Amount',
      description: formatCurrency(data.amount),
    },
    ...(data.fromAccountName
      ? [{ label: 'From Account', description: data.fromAccountName }]
      : []),
    ...(data.toAccountName
      ? [{ label: 'To Account', description: data.toAccountName }]
      : []),
    {
      label: 'Description',
      description: data.description,
    },
    {
      label: 'Date',
      description: DateService.formatDate({
        date: data.date,
        format: 'DAY_MONTH_YEAR_LONG',
      }),
    },
  ]

  return (
    <div>
      <DetailsList items={details} />
    </div>
  )
}
