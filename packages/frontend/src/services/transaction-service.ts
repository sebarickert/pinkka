import type {
  NewTransactionDto,
  TransactionDetailDto,
  TransactionDto,
  UpdateTransactionDto,
} from '@pinkka/schemas/transaction-dto'
import { fetcher } from '@/lib/fetcher'

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

    const response = await fetcher(
      `/api/transactions?${searchParams.toString()}`,
    )

    if (!response.ok) {
      return []
    }

    const { data: transactions } = await response.json()

    return transactions
  },
  async getById(id: string): Promise<TransactionDto> {
    const response = await fetcher(`/api/transactions/${id}`)

    if (!response.ok) {
      throw new Error('Something went wrong. Please try again.')
    }

    const { data: transaction } = await response.json()
    return transaction
  },
  async getByIdDetails(id: string): Promise<TransactionDetailDto> {
    const response = await fetcher(`/api/transactions/${id}/details`)

    if (!response.ok) {
      throw new Error('Something went wrong. Please try again.')
    }

    const { data: transaction } = await response.json()
    return transaction
  },
  async create(data: NewTransactionDto): Promise<TransactionDto> {
    const response = await fetcher(`/api/transactions`, {
      body: JSON.stringify(data),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Something went wrong. Please try again.')
    }

    const { data: newTransaction } = await response.json()
    return newTransaction
  },
  async update({
    id,
    data,
  }: {
    id: string
    data: UpdateTransactionDto
  }): Promise<TransactionDetailDto> {
    const response = await fetcher(`/api/transactions/${id}`, {
      body: JSON.stringify(data),
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Something went wrong. Please try again.')
    }

    const { data: updatedAccount } = await response.json()
    return updatedAccount
  },
  async delete(id: string): Promise<TransactionDetailDto> {
    const response = await fetcher(`/api/transactions/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Something went wrong. Please try again.')
    }

    const { data: deletedTransaction } = await response.json()

    return deletedTransaction
  },
}
