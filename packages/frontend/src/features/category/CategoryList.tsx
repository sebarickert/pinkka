import type { FC } from 'react'
import type { CategoryDto } from '@pinkka/schemas/category-dto'
import { List } from '@/components/List'
import { cn } from '@/lib/utils'

type Props = {
  label?: string
  categories: Array<CategoryDto>
}

export const CategoryList: FC<Props> = ({ label, categories }) => {
  return (
    <List label={label}>
      {categories.map((category) => (
        <CategoryListItem category={category} />
      ))}
    </List>
  )
}

const CategoryListItem: FC<{ category: CategoryDto }> = ({ category }) => {
  return (
    <div className={cn('p-4 bg-layer flex items-center')}>
      <span className="sr-only">Category name</span>
      <span>{category.name}</span>
    </div>
  )
}
