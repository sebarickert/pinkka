import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import * as z from 'zod'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import {
  accountMonthTransactionsQueryOptions,
  accountYearTransactionsQueryOptions,
} from '@/queries/transactions'
import { DateService } from '@/services/date-service'
import {
  accountHasTransactionsQueryOptions,
  financialAccountByIdQueryOptions,
} from '@/queries/financial-accounts'
import { Heading } from '@/components/Heading'
import { TwoColumnLayout } from '@/components/TwoColumnLayout'
import { AccountBalanceHistoryChart } from '@/components/AccountBalanceHistoryChart'
import { FinancialAccountSidebar } from '@/features/financial-account/FinancialAccountSidebar'
import { FinancialAccountTransactions } from '@/features/financial-account/FinancialAccountTransactions'
import { pageTitle } from '@/utils/seo'

const validateSearchSchema = z.object({
  month: z.number().min(1).max(12).optional().catch(DateService.now().month),
  year: z.number().optional().catch(DateService.now().year),
})

export const Route = createFileRoute('/_authenticated/app/accounts/$accountId')(
  {
    validateSearch: validateSearchSchema,
    loaderDeps: ({ search: { month, year } }) => ({ month, year }),
    loader: async ({ params, context, deps }) => {
      const { queryClient } = context
      const now = DateService.now()
      const month = deps.month ?? now.month
      const year = deps.year ?? now.year

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
            year: now.year,
          }),
        ),
        queryClient.ensureQueryData(
          accountHasTransactionsQueryOptions(params.accountId),
        ),
      ])

      const account = await queryClient.ensureQueryData(
        financialAccountByIdQueryOptions(params.accountId),
      )

      return { crumb: account?.name || 'Account Details' }
    },
    head: ({ loaderData }) => ({
      meta: [{ title: pageTitle(loaderData?.crumb || 'Account') }],
    }),
    component: RouteComponent,
  },
)

function RouteComponent() {
  const params = useParams({ from: '/_authenticated/app/accounts/$accountId' })
  const navigate = useNavigate()

  const { data: account } = useSuspenseQuery(
    financialAccountByIdQueryOptions(params.accountId),
  )

  if (!account) {
    navigate({ to: '/app/home' })
    return null
  }

  return (
    <article className="grid gap-8">
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
            </section>
          </section>
        }
        sidebar={<FinancialAccountSidebar account={account} />}
      />
      <TwoColumnLayout main={<FinancialAccountTransactions />} />
    </article>
  )
}
