import {
  Link,
  createFileRoute,
  useParams,
  useSearch,
} from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import * as z from 'zod'
import { DateTime } from 'luxon'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import {
  accountMonthTransactionsQueryOptions,
  accountYearTransactionsQueryOptions,
} from '@/queries/transactions'
import { DATE_FORMAT, DateService } from '@/services/date-service'
import { financialAccountByIdQueryOptions } from '@/queries/financial-accounts'
import { Heading } from '@/components/Heading'
import { TwoColumnLayout } from '@/components/TwoColumnLayout'
import { AccountBalanceHistoryChart } from '@/components/AccountBalanceHistoryChart'
import { GroupedTransactionList } from '@/components/GroupedTransactionList'
import { DetailsList } from '@/components/DetailsList'
import { formatCurrency } from '@/utils/format-currency'
import { cn } from '@/lib/utils'
import { ACCOUNT_TYPE_LABEL_MAPPING } from '@/utils/financial-account'
import { Button } from '@/components/Button'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

export const Route = createFileRoute('/_authenticated/app/accounts/$accountId')(
  {
    validateSearch: z.object({
      month: z
        .number()
        .min(1)
        .max(12)
        .optional()
        .catch(DateService.now().month),
      year: z.number().optional().catch(DateService.now().year),
    }),
    loaderDeps: ({ search: { month, year } }) => ({ month, year }),
    loader: async ({ params, context, deps }) => {
      const { month: paramMonth, year: paramYear } = deps

      const { queryClient } = context
      const now = DateService.now()
      const month = paramMonth ? paramMonth : now.month
      const year = paramYear ? paramYear : now.year

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
      ])

      const account = await queryClient.ensureQueryData(
        financialAccountByIdQueryOptions(params.accountId),
      )

      return { crumb: account?.name || 'Account Details' }
    },
    component: RouteComponent,
  },
)

function RouteComponent() {
  const params = useParams({ from: '/_authenticated/app/accounts/$accountId' })
  const search = useSearch({ from: '/_authenticated/app/accounts/$accountId' })

  const month = search.month ?? DateService.now().month
  const year = search.year ?? DateService.now().year

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

  console.log(account)

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

  const accountDetails = useMemo(() => {
    return [
      {
        label: 'Type',
        description: ACCOUNT_TYPE_LABEL_MAPPING[account.type],
      },
      {
        label: 'Balance',
        description: formatCurrency(account.balance),
      },
    ]
  }, [account])

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
        sidebar={
          <aside>
            <div className="grid gap-8">
              <DetailsList label="Account Details" items={accountDetails} />
              <div className="grid gap-4">
                <ResponsiveDialog
                  title="Edit account"
                  trigger={
                    <Button
                      type="button"
                      accentColor="secondary"
                      className="w-full"
                      size="large"
                    >
                      Edit
                    </Button>
                  }
                >
                  <div>hola</div>
                </ResponsiveDialog>
                {account.type === 'investment' && (
                  <Button
                    type="button"
                    accentColor="secondary"
                    className="w-full"
                    size="large"
                  >
                    Update Market Value
                  </Button>
                )}
                <Button
                  type="button"
                  accentColor="secondary"
                  className="w-full"
                  size="large"
                >
                  Delete
                </Button>
              </div>
            </div>
          </aside>
        }
      />
      <TwoColumnLayout
        main={
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
        }
      />
    </article>
  )
}

const Filters = () => {
  const params = useParams({ from: '/_authenticated/app/accounts/$accountId' })
  const search = useSearch({ from: '/_authenticated/app/accounts/$accountId' })

  const currentDate = DateTime.fromObject({
    month: search.month,
    year: search.year,
  }).toLocal()

  const previous = currentDate.minus({ months: 1 })
  const next = currentDate.plus({ months: 1 })

  return (
    <div
      className={cn(
        'inline-flex items-center',
        '*:h-11 *:w-11 *:inline-flex *:items-center *:justify-center *:-mb-2',
      )}
    >
      <Link
        to="/app/accounts/$accountId"
        params={{ accountId: params.accountId }}
        search={{
          month: previous.month,
          year: previous.year,
        }}
        resetScroll={false}
      >
        <span className="sr-only">Previous month</span>
        <ChevronLeft />
      </Link>
      <Link
        to="/app/accounts/$accountId"
        params={{ accountId: params.accountId }}
        search={{
          month: DateService.now().month,
          year: DateService.now().year,
        }}
        resetScroll={false}
      >
        <span className="sr-only">Current month</span>
        <Calendar />
      </Link>
      <Link
        to="/app/accounts/$accountId"
        params={{ accountId: params.accountId }}
        search={{
          month: next.month,
          year: next.year,
        }}
        resetScroll={false}
      >
        <span className="sr-only">Next month</span>
        <ChevronRight />
      </Link>
    </div>
  )
}
