import type { TransactionDto } from '@pinkka/schemas/transaction-dto'

export type CommonQueryParams = {
  sort?: string
  limit?: number
  year?: number
  month?: number
}

export const TransactionService = {
  async getAll(params?: CommonQueryParams): Promise<Array<TransactionDto>> {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.year) searchParams.append('year', params.year.toString())
    if (params?.month) searchParams.append('month', params.month.toString())

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
}
