import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import * as z from 'zod'
import { LoginForm } from '@/features/LoginForm'
import { Heading } from '@/components/Heading'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/login')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: async ({ search }) => {
    const { data } = await authClient.getSession()

    if (data?.user) {
      throw redirect({
        to: search.redirect || '/app/home',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="max-w-md w-full grid gap-8 py-12 px-4 mx-auto">
      <Heading as="h1">Login</Heading>
      <div className="grid gap-8">
        <p className="text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="underline text-foreground">
            {' '}
            Create account{' '}
          </Link>
        </p>
        <LoginForm />
      </div>
    </div>
  )
}
