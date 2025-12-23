import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/app/accounts')({
  component: RouteComponent,
  loader: () => ({ crumb: 'Accounts' }),
})

function RouteComponent() {
  return <Outlet />
}
