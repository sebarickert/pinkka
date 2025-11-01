import { queryOptions } from '@tanstack/react-query'
import { FinancialAccountService } from '@/services/financial-account-service'

const financialAccountKeys = {
  all: ['financial-accounts'] as const,
  lists: () => [...financialAccountKeys.all, 'list'] as const,
}

export const financialAccountsQueryOptions = queryOptions({
  queryKey: financialAccountKeys.lists(),
  queryFn: async () => FinancialAccountService.getAll(),
})
