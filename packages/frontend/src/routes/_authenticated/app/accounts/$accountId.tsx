import { createFileRoute, useParams } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Settings2,
} from 'lucide-react'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import {
  accountMonthTransactionsQueryOptions,
  accountYearTransactionsQueryOptions,
} from '@/queries/transactions'
import { DateService } from '@/services/date-service'
import { financialAccountByIdQueryOptions } from '@/queries/financial-accounts'
import { Heading } from '@/components/Heading'
import { TwoColumnLayout } from '@/components/TwoColumnLayout'
import { AccountBalanceHistoryChart } from '@/components/AccountBalanceHistoryChart'
import { GroupedTransactionList } from '@/components/GroupedTransactionList'
import { Button } from '@/components/Button'
import { DetailsList } from '@/components/DetailsList'
import { formatCurrency } from '@/utils/format-currency'

export const Route = createFileRoute('/_authenticated/app/accounts/$accountId')(
  {
    loader: async ({ params, context }) => {
      const queryClient = context.queryClient
      const { month, year } = DateService.now()

      await Promise.all([
        queryClient.ensureQueryData(
          accountMonthTransactionsQueryOptions({
            accountId: params.accountId,
            year,
            month,
          }),
        ),
        queryClient.ensureQueryData(
          accountYearTransactionsQueryOptions({
            accountId: params.accountId,
            year,
          }),
        ),
      ])

      const account = await queryClient.ensureQueryData(
        financialAccountByIdQueryOptions(params.accountId),
      )

      return { crumb: account?.name || 'Account Details' }
    },
    wrapInSuspense: true,
    pendingComponent: () => <div>Loading...</div>,
    component: RouteComponent,
  },
)

function RouteComponent() {
  const params = useParams({ from: '/_authenticated/app/accounts/$accountId' })
  const [month, setMonth] = useState(DateService.now().month)
  const [year, setYear] = useState(DateService.now().year)

  const { data: account } = useSuspenseQuery(
    financialAccountByIdQueryOptions(params.accountId),
  )
  const { data: transactions } = useSuspenseQuery(
    accountMonthTransactionsQueryOptions({
      accountId: params.accountId,
      year,
      month,
    }),
  )

  if (!account) {
    return <div>Account not found</div>
  }

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

  const details = useMemo(() => {
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
  }, [])

  return (
    <article>
      <TwoColumnLayout
        main={
          <section className="grid gap-8">
            <Breadcrumbs />
            <section className="grid gap-12">
              <div className="grid gap-4">
                <Heading as="h1">{account.name}</Heading>
                <AccountBalanceHistoryChart
                  accountId={account.id}
                  currentBalance={account.balance}
                />
              </div>
              <section className="grid gap-4">
                <div className="flex items-end justify-between flex-wrap">
                  <Heading className="text-2xl font-medium">
                    Transactions
                  </Heading>
                  <div>
                    <Button
                      type="button"
                      accentColor="ghost"
                      size="icon"
                      className="-mb-2"
                    >
                      <ChevronLeft />
                    </Button>
                    <Button
                      type="button"
                      accentColor="ghost"
                      size="icon"
                      className="-mb-2"
                    >
                      <ChevronRight />
                    </Button>
                    <Button
                      type="button"
                      accentColor="ghost"
                      size="icon"
                      className="-mb-2"
                    >
                      <Settings2 />
                    </Button>
                  </div>
                </div>
                <DetailsList
                  className="border-y pt-4 pb-6"
                  label={DateService.formatDate({ format: 'MONTH_YEAR_LONG' })}
                  items={details}
                />
                <GroupedTransactionList transactions={transactions} />
              </section>
            </section>
          </section>
        }
      />
    </article>
  )
}
