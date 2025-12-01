import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import * as z from 'zod'
import { useMemo } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { DateTime } from 'luxon'
import { ButtonLink } from '@/components/ButtonLink'
import { transactionsByMonthYearQueryOptions } from '@/queries/transactions'
import { TwoColumnLayout } from '@/components/TwoColumnLayout'
import { pageTitle } from '@/utils/seo'
import { NAVIGATION_ITEMS } from '@/constants/navigation'
import { DATE_FORMAT, DateService } from '@/services/date-service'
import { formatCurrency } from '@/utils/format-currency'
import { Heading } from '@/components/Heading'
import { DetailsList } from '@/components/DetailsList'
import { GroupedTransactionList } from '@/features/transaction/GroupedTransactionList'
import { cn } from '@/lib/utils'
import { InfoMessageBlock } from '@/components/InfoMessageBlock'

const validateSearchSchema = z.object({
  month: z.number().min(1).max(12).optional().catch(DateService.now().month),
  year: z.number().optional().catch(DateService.now().year),
})

export const Route = createFileRoute('/_authenticated/app/activity')({
  validateSearch: validateSearchSchema,
  loaderDeps: ({ search: { month, year } }) => ({ month, year }),
  head: () => ({
    meta: [{ title: pageTitle(NAVIGATION_ITEMS.activity.title) }],
  }),
  loader: async ({ context, deps }) => {
    const queryClient = context.queryClient

    const now = DateService.now()
    const month = deps.month ?? now.month
    const year = deps.year ?? now.year

    await queryClient.ensureQueryData(
      transactionsByMonthYearQueryOptions({ month, year }),
    )

    return { crumb: NAVIGATION_ITEMS.activity.title }
  },
  wrapInSuspense: true,
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()

  const month = search.month ?? DateService.now().month
  const year = search.year ?? DateService.now().year

  const { data: transactions } = useSuspenseQuery(
    transactionsByMonthYearQueryOptions({
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

  const calculatedBalance = incomeAmount - expenseAmount

  const label = DateTime.fromObject({ month, year })
    .toLocal()
    .toFormat(DATE_FORMAT.MONTH_YEAR_LONG)

  return (
    <TwoColumnLayout
      main={
        <section className="grid gap-8">
          <div className="flex items-end justify-between flex-wrap">
            <Heading as="h1">{NAVIGATION_ITEMS.activity.title}</Heading>
            <Filters />
          </div>
          <DetailsList
            items={transactionsDetails}
            label={
              <span className="inline-flex items-center gap-1">
                {label}
                <span
                  className={cn(
                    'text-muted-foreground',
                    calculatedBalance > 0 && 'text-green',
                    calculatedBalance < 0 && 'text-red',
                  )}
                >
                  ({formatCurrency(calculatedBalance, true)})
                </span>
              </span>
            }
          />
          {transactions.length === 0 && (
            <InfoMessageBlock
              title={`No transactions for ${label}`}
              description="There are no transactions recorded in this period."
            />
          )}
          {transactions.length > 0 && (
            <GroupedTransactionList
              key={`${month}-${year}`}
              transactions={transactions}
            />
          )}
        </section>
      }
    />
  )
}

const Filters = () => {
  const search = useSearch({ from: '/_authenticated/app/activity' })

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
        '*:text-foreground!',
      )}
    >
      <ButtonLink
        to="/app/activity"
        search={{
          month: previous.month,
          year: previous.year,
        }}
        resetScroll={false}
        accentColor="ghost"
      >
        <span className="sr-only">Previous month</span>
        <ChevronLeft />
      </ButtonLink>
      <ButtonLink
        to="/app/activity"
        search={{
          month: DateService.now().month,
          year: DateService.now().year,
        }}
        resetScroll={false}
        accentColor="ghost"
      >
        <span className="sr-only">Current month</span>
        <Calendar />
      </ButtonLink>
      <ButtonLink
        to="/app/activity"
        search={{
          month: next.month,
          year: next.year,
        }}
        resetScroll={false}
        accentColor="ghost"
      >
        <span className="sr-only">Next month</span>
        <ChevronRight />
      </ButtonLink>
    </div>
  )
}
