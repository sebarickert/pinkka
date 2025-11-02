import { queryOptions } from '@tanstack/react-query'
import { TransactionService } from '@/services/transaction-service'
import { DateService } from '@/services/date-service'

const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  byMonthAndYear: (year: number, month: number) =>
    [...transactionKeys.lists(), { year, month }] as const,
  latest: (limit: number) =>
    [...transactionKeys.lists(), 'latest', { limit }] as const,
}

export const latestTransactionsQueryOptions = queryOptions({
  queryKey: transactionKeys.latest(10),
  queryFn: async () => TransactionService.getAll({ limit: 10 }),
})

const { month, year } = DateService.now().minus({ months: 1 })

export const currentMonthTransactionsQueryOptions = queryOptions({
  queryKey: transactionKeys.byMonthAndYear(year, month),
  queryFn: async () => TransactionService.getAll({ year, month }),
})
