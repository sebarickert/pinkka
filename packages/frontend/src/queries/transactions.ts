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

// const startDate = DateService.now().minus({ days: 30 }).toISODate()
// const endDate = DateService.now().toISODate()

// export const accountTransactionsQueryOptions = (accountId: string) => {
//   return queryOptions({
//     queryKey: transactionKeys.byAccount(accountId),
//     queryFn: async () =>
//       TransactionService.getAll({ accountId, from: startDate, to: endDate }),
//   })
// }
