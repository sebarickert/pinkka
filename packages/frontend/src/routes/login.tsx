import { Link, createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '@/components/LoginForm'
import { Heading } from '@/components/Heading'

export const Route = createFileRoute('/login')({
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
