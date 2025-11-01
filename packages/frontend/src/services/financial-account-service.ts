import type { FinancialAccountDto } from '@pinkka/schemas/financial-account-dto'

export const FinancialAccountService = {
  async getAll(): Promise<Array<FinancialAccountDto>> {
    const response = await fetch('http://localhost:3000/api/accounts', {
      credentials: 'include',
    })

    if (!response.ok) {
      return []
    }

    const { data: accounts } = await response.json()

    return accounts
  },
}
