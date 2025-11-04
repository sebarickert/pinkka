import { queryOptions } from '@tanstack/react-query'
import { TransactionService } from '@/services/transaction-service'
import { DateService } from '@/services/date-service'

const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  latest: (limit: number) =>
    [...transactionKeys.lists(), 'latest', { limit }] as const,
  byMonthAndYear: (year: number, month: number) =>
    [...transactionKeys.lists(), { year, month }] as const,
  byAccountAndYear: (accountId: string, year: number) =>
    [...transactionKeys.lists(), { accountId, year }] as const,
  byAccountAndMonthAndYear: (accountId: string, year: number, month: number) =>
    [...transactionKeys.lists(), { accountId, year, month }] as const,
  byAccount: (accountId: string) =>
    [...transactionKeys.lists(), { accountId }] as const,
}

export const latestTransactionsQueryOptions = queryOptions({
  queryKey: transactionKeys.latest(10),
  queryFn: async () => TransactionService.getAll({ limit: 10 }),
})

export const currentMonthTransactionsQueryOptions = () => {
  const { month, year } = DateService.now()

  return queryOptions({
    queryKey: transactionKeys.byMonthAndYear(year, month),
    queryFn: async () => TransactionService.getAll({ year, month }),
  })
}

export const accountMonthTransactionsQueryOptions = ({
  accountId,
  year,
  month,
}: {
  accountId: string
  year: number
  month: number
}) =>
  queryOptions({
    queryKey: transactionKeys.byAccountAndMonthAndYear(accountId, year, month),
    queryFn: async () => TransactionService.getAll({ accountId, year, month }),
  })

export const accountYearTransactionsQueryOptions = ({
  accountId,
  year,
}: {
  accountId: string
  year: number
}) =>
  queryOptions({
    queryKey: transactionKeys.byAccountAndYear(accountId, year),
    queryFn: async () => TransactionService.getAll({ accountId, year }),
  })
