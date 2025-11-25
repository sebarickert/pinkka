import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { FinancialAccountList } from '@/features/financial-account/FinancialAccountList'
import { TransactionList } from '@/features/transaction/TransactionList'
import { BalanceSummary } from '@/components/BalanceSummary'
import {
  currentMonthTransactionsQueryOptions,
  latestTransactionsQueryOptions,
} from '@/queries/transactions'
import { financialAccountsQueryOptions } from '@/queries/financial-accounts'
import { TwoColumnLayout } from '@/components/TwoColumnLayout'
import { pageTitle } from '@/utils/seo'

export const Route = createFileRoute('/_authenticated/app/home')({
  head: () => ({
    meta: [{ title: pageTitle('Home') }],
  }),
  loader: async ({ context }) => {
    const queryClient = context.queryClient
    await Promise.all([
      queryClient.ensureQueryData(financialAccountsQueryOptions),
      queryClient.ensureQueryData(currentMonthTransactionsQueryOptions()),
      queryClient.ensureQueryData(latestTransactionsQueryOptions),
    ])

    return { crumb: 'Home' }
  },
  wrapInSuspense: true,
  pendingComponent: () => <div>Loading...</div>,
  component: RouteComponent,
})

function RouteComponent() {
  const { data: latestTransactions } = useSuspenseQuery(
    latestTransactionsQueryOptions,
  )

  return (
    <TwoColumnLayout
      main={
        <div className="grid gap-8">
          <BalanceSummary />
          <FinancialAccountList />
          <TransactionList
            label="Latest activity"
            transactions={latestTransactions}
          />
        </div>
      }
    />
  )
}
