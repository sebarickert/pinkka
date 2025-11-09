import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Heading } from '@/components/Heading'
import { TwoColumnLayout } from '@/components/TwoColumnLayout'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CreateCategoryDialog } from '@/features/category/CreateCategoryDialog'
import { CategoryList } from '@/features/category/CategoryList'
import { getAllCategoriesOptions } from '@/queries/categories'

export const Route = createFileRoute('/_authenticated/app/categories/')({
  loader: async ({ context }) => {
    const queryClient = context.queryClient

    await queryClient.ensureQueryData(getAllCategoriesOptions)
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { data: categories } = useSuspenseQuery(getAllCategoriesOptions)

  return (
    <div>
      <TwoColumnLayout
        main={
          <section className="grid gap-8">
            <Breadcrumbs />
            <Heading as="h1">Categories</Heading>
            <CategoryList categories={categories} />
          </section>
        }
        sidebar={
          <aside>
            <CreateCategoryDialog />
          </aside>
        }
      />
    </div>
  )
}
