import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { AppShell } from '@/components/AppShell'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { data } = await authClient.getSession()

    if (!data?.user) {
      throw redirect({
        to: '/login',
        search: {
          // Save current location for redirect after login
          redirect: location.href,
        },
      })
    }
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
})
