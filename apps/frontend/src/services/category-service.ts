import type {
  CategoryDto,
  NewCategoryDto,
  UpdateCategoryDto,
} from '@pinkka/schemas/category-dto'
import { fetcher } from '@/lib/fetcher'

export const CategoryService = {
  async getAll(): Promise<Array<CategoryDto>> {
    const response = await fetcher('/api/categories')

    if (!response.ok) {
      return []
    }

    const { data: accounts } = await response.json()

    return accounts
  },
  async getById(id: string): Promise<CategoryDto | null> {
    const response = await fetcher(`/categories/${id}`)

    if (!response.ok) {
      return null
    }

    const { data: account } = await response.json()

    return account
  },
  async hasTransactions(id: string) {
    const response = await fetcher(`/api/categories/${id}/has-transactions`)

    if (!response.ok) {
      return null
    }

    const { data } = (await response.json()) as {
      data: { hasTransactions: boolean }
    }

    return data.hasTransactions
  },
  async create(data: NewCategoryDto): Promise<CategoryDto> {
    const response = await fetcher('/api/categories', {
      body: JSON.stringify(data),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Something went wrong. Please try again.')
    }

    const { data: newCategory } = await response.json()
    return newCategory
  },
  async update({
    id,
    data,
  }: {
    id: string
    data: UpdateCategoryDto
  }): Promise<CategoryDto> {
    const response = await fetcher(`/api/categories/${id}`, {
      body: JSON.stringify(data),
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Something went wrong. Please try again.')
    }

    const { data: updatedCategory } = await response.json()
    return updatedCategory
  },
  async delete(id: string): Promise<CategoryDto> {
    const response = await fetcher(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Something went wrong. Please try again.')
    }

    const { data: deletedCategory } = await response.json()

    return deletedCategory
  },
}
