import { queryOptions } from '@tanstack/react-query'
import { TransactionService } from '@/services/transaction-service'

const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  currentMonth: (year: number, month: number) =>
    [...transactionKeys.lists(), { year, month }] as const,
  latest: (limit: number) =>
    [...transactionKeys.lists(), 'latest', { limit }] as const,
}

export const latestTransactionsQueryOptions = queryOptions({
  queryKey: transactionKeys.latest(10),
  queryFn: async () => TransactionService.getAll({ limit: 10 }),
})

const now = new Date()
const year = now.getFullYear()
const month = now.getMonth() + 1

export const currentMonthTransactionsQueryOptions = queryOptions({
  queryKey: transactionKeys.currentMonth(year, month),
  queryFn: async () => TransactionService.getAll({ year, month }),
})
