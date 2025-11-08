import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { DateTime } from 'luxon'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useParams, useSearch } from '@tanstack/react-router'
import type { FC } from 'react'
import { DetailsList } from '@/components/DetailsList'
import { GroupedTransactionList } from '@/components/GroupedTransactionList'
import { Heading } from '@/components/Heading'
import { accountMonthTransactionsQueryOptions } from '@/queries/transactions'
import { DATE_FORMAT, DateService } from '@/services/date-service'
import { formatCurrency } from '@/utils/format-currency'
import { Filters } from '@/features/financial-account/Filters'

export const FinancialAccountTransactions: FC = () => {
  const params = useParams({ from: '/_authenticated/app/accounts/$accountId' })
  const search = useSearch({ from: '/_authenticated/app/accounts/$accountId' })

  const month = search.month ?? DateService.now().month
  const year = search.year ?? DateService.now().year

  const { data: transactions } = useSuspenseQuery(
    accountMonthTransactionsQueryOptions({
      accountId: params.accountId,
      year,
      month,
    }),
  )

  const incomeAmount = useMemo(() => {
    return transactions
      .filter(({ type }) => type === 'income')
      .reduce((sum, txn) => sum + txn.amount, 0)
  }, [transactions])
  const expenseAmount = useMemo(() => {
    return transactions
      .filter(({ type }) => type === 'expense')
      .reduce((sum, txn) => sum + txn.amount, 0)
  }, [transactions])

  const transactionsDetails = useMemo(() => {
    return [
      {
        Icon: ArrowDown,
        label: 'Incomes',
        description: formatCurrency(incomeAmount),
      },
      {
        Icon: ArrowUp,
        label: 'Expenses',
        description: formatCurrency(expenseAmount),
      },
    ]
  }, [incomeAmount, expenseAmount])

  const label = DateTime.fromObject({ month, year })
    .toLocal()
    .toFormat(DATE_FORMAT.MONTH_YEAR_LONG)

  return (
    <section className="grid gap-12">
      <section className="grid gap-4">
        <div className="flex items-end justify-between flex-wrap">
          <Heading className="text-2xl font-medium">Transactions</Heading>
          <Filters />
        </div>
        <DetailsList
          className="border-y pt-4 pb-6"
          label={label}
          items={transactionsDetails}
        />
        <GroupedTransactionList transactions={transactions} />
      </section>
    </section>
  )
}
