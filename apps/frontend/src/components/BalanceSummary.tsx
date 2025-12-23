import { useSuspenseQuery } from '@tanstack/react-query'
import { ArrowDown, ArrowUp } from 'lucide-react'
import type { FinancialAccountDto } from '@pinkka/schemas/financial-account-dto'
import type { FC } from 'react'
import type { DetailsItem } from '@/components/DetailsList'
import { DetailsList } from '@/components/DetailsList'
import { formatCurrency } from '@/utils/format-currency'
import { currentMonthTransactionsQueryOptions } from '@/queries/transactions'
import { financialAccountsQueryOptions } from '@/queries/financial-accounts'
import { DateService } from '@/services/date-service'
import { cn } from '@/lib/utils'

const ACCOUNT_TYPES_INCLUDED_IN_TOTAL: Array<FinancialAccountDto['type']> = [
  'bank',
  'wallet',
  'investment',
]

const getIncomeExpenseTotals = (
  transactions: Array<{ type: string; amount: number }>,
) =>
  transactions.reduce(
    (totals, transaction) => {
      if (transaction.type === 'income') {
        totals.incomes += transaction.amount
      } else if (transaction.type === 'expense') {
        totals.expenses += transaction.amount
      }
      return totals
    },
    { incomes: 0, expenses: 0 },
  )

export const BalanceSummary: FC = () => {
  const { data: accounts } = useSuspenseQuery(financialAccountsQueryOptions)
  const { data: currentMonthTransactions } = useSuspenseQuery(
    currentMonthTransactionsQueryOptions(),
  )

  const currentMonthTotals = getIncomeExpenseTotals(currentMonthTransactions)

  const totalBalance = accounts
    .filter((account) => ACCOUNT_TYPES_INCLUDED_IN_TOTAL.includes(account.type))
    .reduce((acc, { balance }) => acc + balance, 0)

  const list = [
    {
      label: 'Incomes',
      description: formatCurrency(currentMonthTotals.incomes),
      Icon: ArrowDown,
    },
    {
      label: 'Expenses',
      description: formatCurrency(currentMonthTotals.expenses),
      Icon: ArrowUp,
    },
  ] satisfies Array<DetailsItem>

  const calculatedBalance =
    currentMonthTotals.incomes - currentMonthTotals.expenses

  return (
    <div className="grid gap-6">
      <div className="grid">
        <span className="text-muted-foreground">Balance</span>
        <span className="font-semibold text-4xl">
          {formatCurrency(totalBalance)}
        </span>
      </div>
      <DetailsList
        items={list}
        label={
          <span className="inline-flex items-center gap-1">
            {DateService.formatDate({ format: 'MONTH_YEAR_LONG' })}
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
    </div>
  )
}
