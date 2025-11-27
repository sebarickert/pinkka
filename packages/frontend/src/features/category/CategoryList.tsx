import { Tags } from 'lucide-react'
import type { FC } from 'react'
import type { CategoryDto } from '@pinkka/schemas/category-dto'
import { cn } from '@/lib/utils'
import { List } from '@/components/List'
import { TRANSACTION_TYPE_LABEL_MAPPING } from '@/utils/transaction'
import { EditCategoryDialog } from '@/features/category/EditCategoryDialog'
import { DeleteCategoryDialog } from '@/features/category/DeleteCategoryDialog'
import { InfoMessageBlock } from '@/components/InfoMessageBlock'
import { Button } from '@/components/Button'
import { CreateCategoryDialog } from '@/features/category/CreateCategoryDialog'

type Props = {
  label?: string
  categories: Array<CategoryDto>
}

export const CategoryList: FC<Props> = ({ label, categories }) => {
  if (categories.length === 0) {
    return (
      <InfoMessageBlock
        title="No categories found"
        description="You haven't created any categories yet. Add your first category to better organize and analyze your transactions."
      >
        <CreateCategoryDialog>
          <Button type="button">Create Category</Button>
        </CreateCategoryDialog>
      </InfoMessageBlock>
    )
  }

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
    <div
      className={cn(
        'grid grid-cols-[auto_1fr_auto] items-center gap-4 pr-2',
        'hover:bg-layer',
        'group',
      )}
    >
      <div
        className={cn(
          'size-14 inline-flex items-center justify-center bg-layer',
          'group-hover:bg-accent',
        )}
      >
        <Tags />
      </div>
      <div className="grid">
        <span className="truncate font-medium text-sm">{category.name}</span>
        <span className="text-muted-foreground text-xs">
          <span className="sr-only">Category type</span>
          <span>{TRANSACTION_TYPE_LABEL_MAPPING[category.type]}</span>
        </span>
      </div>
      <div className="inline-flex group-hover:*:text-foreground!">
        <EditCategoryDialog category={category} />
        <DeleteCategoryDialog categoryId={category.id} />
      </div>
    </div>
  )
}
