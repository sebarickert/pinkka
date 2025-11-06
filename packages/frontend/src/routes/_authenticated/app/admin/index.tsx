import { createFileRoute } from '@tanstack/react-router'
import { Heading } from '@/components/Heading'
import { authClient } from '@/lib/auth-client'
import { List } from '@/components/List'
import { TwoColumnLayout } from '@/components/TwoColumnLayout'

export const Route = createFileRoute('/_authenticated/app/admin/')({
  loader: async () => {
    return authClient.admin.listUsers({ query: {} })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = Route.useLoaderData()

  return (
    <TwoColumnLayout
      main={
        <div className="grid gap-6">
          <Heading as="h1">Admin Dashboard</Heading>
          <List label="Registered Users">
            {data &&
              data.users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 gap-4 bg-layer flex items-center"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{user.email}</span>
                    <span className="text-sm text-muted-foreground">
                      Role: {user.role}
                    </span>
                  </div>
                </div>
              ))}
          </List>
        </div>
      }
    />
  )
}
