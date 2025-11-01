import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense } from 'react'
import * as TanStackQueryProvider from '@/integrations/tanstack-query/root-provider'

import { FinancialAccountList } from '@/components/FinancialAccountList'
import { TransactionList } from '@/components/TransactionList'
import { BalanceSummary } from '@/components/BalanceSummary'
import {
  currentMonthTransactionsQueryOptions,
  latestTransactionsQueryOptions,
} from '@/queries/transactions'
import { financialAccountsQueryOptions } from '@/queries/financial-accounts'

export const Route = createFileRoute('/_authenticated/app/home')({
  loader: async () => {
    const queryClient = TanStackQueryProvider.getContext().queryClient
    await Promise.all([
      queryClient.ensureQueryData(financialAccountsQueryOptions),
      queryClient.ensureQueryData(currentMonthTransactionsQueryOptions),
      queryClient.ensureQueryData(latestTransactionsQueryOptions),
    ])
  },
  component: SuspendedRouteComponent,
})

export default function SuspendedRouteComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RouteComponent />
    </Suspense>
  )
}

function RouteComponent() {
  const { data: latestTransactions } = useSuspenseQuery(
    latestTransactionsQueryOptions,
  )

  return (
    <div className="grid gap-8">
      <BalanceSummary />
      <FinancialAccountList />
      <TransactionList transactions={latestTransactions} />
    </div>
  )
}
