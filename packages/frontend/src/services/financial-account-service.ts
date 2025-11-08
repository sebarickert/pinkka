import type {
  FinancialAccountDto,
  UpdateFinancialAccountDto,
} from '@pinkka/schemas/financial-account-dto'

// @todo: Add try catches and proper error handling/logging
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
  async hasTransactions(id: string) {
    const response = await fetch(
      `http://localhost:3000/api/accounts/${id}/has-transactions`,
      {
        credentials: 'include',
      },
    )

    if (!response.ok) {
      return null
    }

    const { data } = (await response.json()) as {
      data: { hasTransactions: boolean }
    }

    return data.hasTransactions
  },
  async update(
    id: string,
    data: UpdateFinancialAccountDto,
  ): Promise<FinancialAccountDto | null> {
    try {
      const response = await fetch(`http://localhost:3000/api/accounts/${id}`, {
        body: JSON.stringify(data),
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        return null
      }

      const { data: updatedAccount } = await response.json()

      return updatedAccount
    } catch (error) {
      return null
    }
  },
}
