import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/app/categories')({
  component: RouteComponent,
  loader: () => ({ crumb: 'Categories' }),
})

function RouteComponent() {
  return <Outlet />
}
