import { createFileRoute } from '@tanstack/react-router'
import { Heading } from '@/components/Heading'
import { authClient } from '@/lib/auth-client'
import { List } from '@/components/List'
import { TwoColumnLayout } from '@/components/TwoColumnLayout'
import { pageTitle } from '@/utils/seo'
import { UserListItem } from '@/features/admin/UserListItem'

const USER_ROLE_ORDER: Array<'admin' | 'user'> = ['admin', 'user']

export const Route = createFileRoute('/_authenticated/app/admin/')({
  loader: async () => {
    return authClient.admin.listUsers({ query: {} })
  },
  head: () => ({
    meta: [{ title: pageTitle('Admin Dashboard') }],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = Route.useLoaderData()

  if (!data) {
    return <div>No data available</div>
  }

  const usersByRole = Object.groupBy(data.users, (user) => user.role || 'user')

  return (
    <TwoColumnLayout
      main={
        <div className="grid gap-6">
          <Heading as="h1">Admin Dashboard</Heading>
          <List label="Registered Users">
            {USER_ROLE_ORDER.map((role) =>
              usersByRole[role]
                ?.toSorted((a, b) => a.name.localeCompare(b.name))
                .map((user) => <UserListItem {...user} key={user.id} />),
            )}
          </List>
        </div>
      }
    />
  )
}
