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
  const months = data.map((tx) => {
    const dt = DateTime.fromISO(tx.date)
    return { year: dt.year, month: dt.month }
  })
  const uniqueMonths = Array.from(
    new Set(months.map((m) => `${m.year}-${m.month}`)),
  ).map((str) => {
    const [year, month] = str.split('-').map(Number)
    return { year, month }
  })
  uniqueMonths.sort((a, b) =>
    a.year === b.year ? a.month - b.month : a.year - b.year,
  )

  // Group transactions by year-month
  const transactionsByYearMonth = new Map<string, Array<TransactionDto>>()
  for (const tx of data) {
    const dt = DateTime.fromISO(tx.date)
    const key = `${dt.year}-${dt.month}`
    if (!transactionsByYearMonth.has(key)) transactionsByYearMonth.set(key, [])
    transactionsByYearMonth.get(key)!.push(tx)
  }

  let balance = currentBalance
  const result: Array<{ time: string; value: number }> = []

  // Start from latest month, go back to earliest
  for (let i = uniqueMonths.length - 1; i >= 0; i--) {
    const { year, month } = uniqueMonths[i]
    const key = `${year}-${month}`
    const txs = (transactionsByYearMonth.get(key) ?? []).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )

    // Reverse the effect of each transaction in this month
    for (const tx of txs) {
      if (tx.type === 'income' && tx.toAccountId === accountId)
        balance -= tx.amount
      if (tx.type === 'expense' && tx.fromAccountId === accountId)
        balance += tx.amount
      if (tx.type === 'transfer') {
        if (tx.toAccountId === accountId) balance -= tx.amount
        if (tx.fromAccountId === accountId) balance += tx.amount
      }
    }

    // Use last transaction date of the month, or last day of month if none
    let time: string
    if (txs.length > 0) {
      time = DateTime.fromISO(txs[0].date).toISODate()
    } else {
      time = DateTime.local(year, month).endOf('month').toISODate()
    }

    result.push({ time, value: balance })
  }

  // Sort result oldest to newest
  return result.sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  )
}
