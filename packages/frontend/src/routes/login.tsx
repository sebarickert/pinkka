import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import * as z from 'zod'
import { LoginForm } from '@/components/LoginForm'
import { Heading } from '@/components/Heading'
import { authClient } from '@/lib/auth-client'

const fallback = '/app/home' as const

export const Route = createFileRoute('/login')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: async ({ search }) => {
    const { data } = await authClient.getSession()

    if (data?.user) {
      throw redirect({
        to: search.redirect ?? fallback,
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="w-full max-w-md mx-auto grid gap-8">
      <Heading level="h1">Login</Heading>
      <div className="grid gap-8">
        <p className="text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-white underline">
            {' '}
            Create account{' '}
          </Link>
        </p>
        <LoginForm />
      </div>
    </div>
  )
}
