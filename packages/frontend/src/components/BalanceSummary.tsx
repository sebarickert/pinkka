import { useSuspenseQuery } from '@tanstack/react-query'
import type { FinancialAccountDto } from '@pinkka/schemas/financial-account-dto'
import type { FC } from 'react'
import { formatCurrency } from '@/utils/format-currency'
import { currentMonthTransactionsQueryOptions } from '@/queries/transactions'
import { financialAccountsQueryOptions } from '@/queries/financial-accounts'

const ACCOUNT_TYPES_INCLUDED_IN_TOTAL: Array<FinancialAccountDto['type']> = [
  'bank',
  'wallet',
  'investment',
]

export const BalanceSummary: FC = () => {
  const { data: accounts } = useSuspenseQuery(financialAccountsQueryOptions)
  const { data: currentMonthTransactions } = useSuspenseQuery(
    currentMonthTransactionsQueryOptions,
  )

  console.log(currentMonthTransactions)

  const totalBalance = accounts
    .filter((account) => ACCOUNT_TYPES_INCLUDED_IN_TOTAL.includes(account.type))
    .reduce((acc, { balance }) => acc + balance, 0)

  return (
    <div className="grid">
      <span className="text-muted-foreground">Balance</span>
      <span className="font-semibold text-4xl">
        {formatCurrency(totalBalance)}
      </span>
    </div>
  )
}
