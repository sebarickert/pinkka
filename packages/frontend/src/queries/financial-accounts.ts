import { queryOptions } from '@tanstack/react-query'
import { FinancialAccountService } from '@/services/financial-account-service'

const financialAccountKeys = {
  all: ['financial-accounts'] as const,
  lists: () => [...financialAccountKeys.all, 'list'] as const,
  byId: (id: string) => [...financialAccountKeys.all, id] as const,
}

export const financialAccountsQueryOptions = queryOptions({
  queryKey: financialAccountKeys.lists(),
  queryFn: async () => FinancialAccountService.getAll(),
})

export const financialAccountByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: financialAccountKeys.byId(id),
    queryFn: async () => FinancialAccountService.getById(id),
  })
