import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_authenticated/app/admin')({
  beforeLoad: async () => {
    const { data } = await authClient.getSession()

    if (!data || data.user.role !== 'admin') {
      throw redirect({
        to: '/app/home',
      })
    }
  },
  component: () => <Outlet />,
})
