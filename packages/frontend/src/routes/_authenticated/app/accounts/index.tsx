import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/_authenticated/app/accounts/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate({ to: '/app/home', replace: true })
  }, [navigate])

  return <Outlet />
}
