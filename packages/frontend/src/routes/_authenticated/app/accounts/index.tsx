import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { pageTitle } from '@/utils/seo'

export const Route = createFileRoute('/_authenticated/app/accounts/')({
  head: () => ({
    meta: [{ title: pageTitle('Account') }],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate({ to: '/app/home', replace: true })
  }, [navigate])

  return <Outlet />
}
