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
import { InfoMessageBlock } from '@/components/InfoMessageBlock'
import { CreateTransactionDialog } from '@/features/transaction/CreateTransactionDialog'
import { Button } from '@/components/Button'
import { NAVIGATION_ITEMS } from '@/constants/navigation'
import { Heading } from '@/components/Heading'

export const Route = createFileRoute('/_authenticated/app/home')({
  head: () => ({
    meta: [{ title: pageTitle(NAVIGATION_ITEMS.home.title) }],
  }),
  loader: async ({ context }) => {
    const queryClient = context.queryClient
    await Promise.all([
      queryClient.ensureQueryData(financialAccountsQueryOptions),
      queryClient.ensureQueryData(currentMonthTransactionsQueryOptions()),
      queryClient.ensureQueryData(latestTransactionsQueryOptions),
    ])

    return { crumb: NAVIGATION_ITEMS.home.title }
  },
  wrapInSuspense: true,
  component: RouteComponent,
})

function RouteComponent() {
  const transactions = useSuspenseQuery(latestTransactionsQueryOptions)
  const { data: accounts } = useSuspenseQuery(financialAccountsQueryOptions)

  return (
    <TwoColumnLayout
      main={
        <div className="grid gap-8">
          <Heading as="h1" className="sr-only">
            {NAVIGATION_ITEMS.home.title}
          </Heading>
          <BalanceSummary />
          <FinancialAccountList />
          {accounts.length > 0 && (
            <div>
              <TransactionList
                label="Latest activity"
                transactions={transactions.data}
              />
              {transactions.data.length === 0 && (
                <InfoMessageBlock
                  title="No recent transactions"
                  description="Once you add transactions, your latest activity will appear here to help you track your finances at a glance."
                >
                  <CreateTransactionDialog>
                    <Button type="button">Create Transaction</Button>
                  </CreateTransactionDialog>
                </InfoMessageBlock>
              )}
            </div>
          )}
        </div>
      }
    />
  )
}
