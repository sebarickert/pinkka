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
  async getById(id: string): Promise<FinancialAccountDto | null> {
    const response = await fetch(`http://localhost:3000/api/accounts/${id}`, {
      credentials: 'include',
    })

    if (!response.ok) {
      return null
    }

    const { data: account } = await response.json()

    return account
  },
}
