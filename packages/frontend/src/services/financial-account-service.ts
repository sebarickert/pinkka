import type {
  FinancialAccountDto,
  NewFinancialAccountDto,
  UpdateFinancialAccountDto,
} from '@pinkka/schemas/financial-account-dto'

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
  async create(data: NewFinancialAccountDto): Promise<FinancialAccountDto> {
    const response = await fetch(`http://localhost:3000/api/accounts`, {
      body: JSON.stringify(data),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Something went wrong. Please try again.')
    }

    const { data: newAccount } = await response.json()
    return newAccount
  },
  async update({
    id,
    data,
  }: {
    id: string
    data: UpdateFinancialAccountDto
  }): Promise<FinancialAccountDto> {
    const response = await fetch(`http://localhost:3000/api/accounts/${id}`, {
      body: JSON.stringify(data),
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Something went wrong. Please try again.')
    }

    const { data: updatedAccount } = await response.json()
    return updatedAccount
  },
  async delete(id: string): Promise<FinancialAccountDto> {
    const response = await fetch(`http://localhost:3000/api/accounts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Something went wrong. Please try again.')
    }

    const { data: deletedAccount } = await response.json()

    return deletedAccount
  },
}
