import { createFileRoute, useParams } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import {
  accountMonthTransactionsQueryOptions,
  accountYearTransactionsQueryOptions,
} from '@/queries/transactions'
import { DateService } from '@/services/date-service'
import { financialAccountByIdQueryOptions } from '@/queries/financial-accounts'
import { Heading } from '@/components/Heading'
import { TwoColumnLayout } from '@/components/TwoColumnLayout'
import { TransactionList } from '@/components/TransactionList'
import { AccountBalanceHistoryChart } from '@/components/AccountBalanceHistoryChart'

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
  const {
    data: transactions,
    isFetching,
    isLoading,
    isRefetching,
  } = useSuspenseQuery(
    accountMonthTransactionsQueryOptions({
      accountId: params.accountId,
      year,
      month,
    }),
  )

  if (!account) {
    return <div>Account not found</div>
  }

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
                <Heading className="text-2xl font-medium">Transactions</Heading>
                <TransactionList transactions={transactions} />
              </section>
            </section>
          </section>
        }
      />
    </article>
  )
}
