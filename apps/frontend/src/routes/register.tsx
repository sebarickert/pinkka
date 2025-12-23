import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { Heading } from '@/components/Heading'
import { RegisterForm } from '@/features/RegisterForm'
import { authClient } from '@/lib/auth-client'
import { pageTitle } from '@/utils/seo'

export const Route = createFileRoute('/register')({
  head: () => ({
    meta: [{ title: pageTitle('Register') }],
  }),
  beforeLoad: async () => {
    try {
      const { data } = await authClient.getSession()

      if (data?.user) {
        throw redirect({
          to: '/app/home',
        })
      }
    } catch (error) {
      // Backend not reachable → just let the page load
      console.warn('Could not fetch session', error)
      return
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="max-w-md w-full grid gap-8 py-12 px-4 mx-auto">
      <Heading as="h1">Create account</Heading>
      <div className="grid gap-8">
        <p className="text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="underline text-foreground">
            {' '}
            Log in{' '}
          </Link>
        </p>
        <RegisterForm />
      </div>
    </div>
  )
}
