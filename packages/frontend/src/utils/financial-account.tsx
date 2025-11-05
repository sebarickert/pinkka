import {
  ChartNoAxesCombined,
  CreditCard,
  HandCoins,
  Landmark,
  Wallet,
} from 'lucide-react'
import { DateTime } from 'luxon'
import type { FinancialAccountDto } from '@pinkka/schemas/financial-account-dto'
import type { TransactionDto } from '@pinkka/schemas/transaction-dto'

export const ACCOUNT_TYPE_LABEL_MAPPING: Record<
  FinancialAccountDto['type'],
  string
> = {
  bank: 'Bank',
  credit_card: 'Credit Card',
  wallet: 'Wallet',
  investment: 'Investment',
  loan: 'Loan',
}

export function getFinancialAccountIcon(type: FinancialAccountDto['type']) {
  switch (type) {
    case 'credit_card':
      return <CreditCard />
    case 'bank':
      return <Landmark />
    case 'wallet':
      return <Wallet />
    case 'investment':
      return <ChartNoAxesCombined />
    case 'loan':
    default:
      return <HandCoins />
  }
}

export function constructBalanceChartData({
  data,
  accountId,
  currentBalance,
}: {
  data: Array<TransactionDto>
  accountId: string
  currentBalance: number
}) {
  const groupedTransactionsByYearMonth = Object.groupBy(data, ({ date }) => {
    const { year, month } = DateTime.fromISO(date)
    return `${year}-${month}`
  }) as Record<string, Array<TransactionDto>>

  const sortedUniqueMonthsAsc = Object.keys(groupedTransactionsByYearMonth)
    .map((str) => {
      const [year, month] = str.split('-').map(Number)
      return { year, month }
    })
    .toSorted((a, b) =>
      a.year === b.year ? a.month - b.month : a.year - b.year,
    )

  let balance = currentBalance
  const result: Array<{ time: string; value: number }> = []

  // Start from latest month, go back to earliest
  for (let i = sortedUniqueMonthsAsc.length - 1; i >= 0; i--) {
    const { year, month } = sortedUniqueMonthsAsc[i]
    const key = `${year}-${month}`
    const transactions = groupedTransactionsByYearMonth[key]

    // Reverse the effect of each transaction in this month
    for (const { type, toAccountId, fromAccountId, amount } of transactions) {
      if (type === 'income' && toAccountId === accountId) {
        balance -= amount
      }

      if (type === 'expense' && fromAccountId === accountId) {
        balance += amount
      }

      if (type === 'transfer') {
        if (toAccountId === accountId) balance -= amount
        if (fromAccountId === accountId) {
          balance += amount
        }
      }
    }

    // Use last transaction date of the month, or last day of month if none
    let time: string

    if (transactions.length > 0) {
      time =
        DateTime.fromISO(transactions[0].date).endOf('month').toISODate() ?? ''
      result.push({ time, value: balance })
    }
  }

  return result.toSorted(
    (a, b) =>
      DateTime.fromISO(a.time).toMillis() - DateTime.fromISO(b.time).toMillis(),
  )
}
