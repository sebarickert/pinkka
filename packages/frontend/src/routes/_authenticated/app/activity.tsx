import { Link, createFileRoute } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_authenticated/app/activity')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = authClient.useSession()

  return (
    <div>
      Hello "/app/activity"! {data?.user.name}{' '}
      <Link to="/app/home">Go to Home</Link>
    </div>
  )
}
