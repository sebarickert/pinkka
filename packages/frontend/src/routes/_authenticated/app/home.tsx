import { createFileRoute } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Suspense } from 'react'
import * as TanStackQueryProvider from '@/integrations/tanstack-query/root-provider'
import { FinancialAccountService } from '@/services/financial-account-service'
import { FinancialAccountList } from '@/components/FinancialAccountList'
import { TransactionService } from '@/services/transaction-service'
import { TransactionList } from '@/components/TransactionList'

const financialAccountsQueryOptions = queryOptions({
  queryKey: ['financial-accounts'],
  queryFn: async () => FinancialAccountService.getAll(),
})

const transactionsQueryOptions = queryOptions({
  queryKey: ['transactions', { limit: 10 }],
  queryFn: async () => TransactionService.getAll({ limit: 10 }),
})

export const Route = createFileRoute('/_authenticated/app/home')({
  loader: async () => {
    const queryClient = TanStackQueryProvider.getContext().queryClient
    await Promise.all([
      queryClient.ensureQueryData(financialAccountsQueryOptions),
      queryClient.ensureQueryData(transactionsQueryOptions),
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
  const { data: financialAccounts } = useSuspenseQuery(
    financialAccountsQueryOptions,
  )
  const { data: transactions } = useSuspenseQuery(transactionsQueryOptions)

  return (
    <div className="grid gap-8">
      <FinancialAccountList accounts={financialAccounts} />
      <TransactionList transactions={transactions} />
    </div>
  )
}
