import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { Heading } from '@/components/Heading'
import { RegisterForm } from '@/features/RegisterForm'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/register')({
  beforeLoad: async () => {
    const { data } = await authClient.getSession()

    if (data?.user) {
      throw redirect({
        to: '/app/home',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="w-full max-w-md mx-auto grid gap-8 py-12">
      <Heading as="h1">Create account</Heading>
      <div className="grid gap-8">
        <p className="text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-white underline">
            {' '}
            Log in{' '}
          </Link>
        </p>
        <RegisterForm />
      </div>
    </div>
  )
}
