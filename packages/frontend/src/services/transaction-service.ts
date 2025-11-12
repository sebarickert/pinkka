import type {
  TransactionDetailDto,
  TransactionDto,
  UpdateTransactionDto,
} from '@pinkka/schemas/transaction-dto'

export type CommonQueryParams = {
  sort?: string
  limit?: number
  year?: number
  month?: number
}

export const TransactionService = {
  async getAll(
    params?: { accountId?: string } & CommonQueryParams,
  ): Promise<Array<TransactionDto>> {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.year) searchParams.append('year', params.year.toString())
    if (params?.month) searchParams.append('month', params.month.toString())
    if (params?.accountId) searchParams.append('accountId', params.accountId)

    const response = await fetch(
      `http://localhost:3000/api/transactions?${searchParams.toString()}`,
      {
        credentials: 'include',
      },
    )

    if (!response.ok) {
      return []
    }

    const { data: transactions } = await response.json()

    return transactions
  },
  async getById(id: string): Promise<TransactionDto> {
    const response = await fetch(
      `http://localhost:3000/api/transactions/${id}`,
      {
        credentials: 'include',
      },
    )

    if (!response.ok) {
      throw new Error('Something went wrong. Please try again.')
    }

    const { data: transaction } = await response.json()
    return transaction
  },
  async getByIdDetails(id: string): Promise<TransactionDetailDto> {
    const response = await fetch(
      `http://localhost:3000/api/transactions/${id}/details`,
      {
        credentials: 'include',
      },
    )

    if (!response.ok) {
      throw new Error('Something went wrong. Please try again.')
    }

    const { data: transaction } = await response.json()
    return transaction
  },
  async update({
    id,
    data,
  }: {
    id: string
    data: UpdateTransactionDto
  }): Promise<TransactionDetailDto> {
    const response = await fetch(
      `http://localhost:3000/api/transactions/${id}`,
      {
        body: JSON.stringify(data),
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      },
    )

    if (!response.ok) {
      throw new Error('Something went wrong. Please try again.')
    }

    const { data: updatedAccount } = await response.json()
    return updatedAccount
  },
  async delete(id: string): Promise<TransactionDetailDto> {
    const response = await fetch(
      `http://localhost:3000/api/transactions/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      },
    )

    if (!response.ok) {
      throw new Error('Something went wrong. Please try again.')
    }

    const { data: deletedTransaction } = await response.json()

    return deletedTransaction
  },
}
