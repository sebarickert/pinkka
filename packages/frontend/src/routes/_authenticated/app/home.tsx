import { Link, createFileRoute } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_authenticated/app/home')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = authClient.useSession()

  return (
    <div>
      Hello "/app/home"! {data?.user.name}
      <Link to="/app/activity">Go to Activity</Link>
    </div>
  )
}
