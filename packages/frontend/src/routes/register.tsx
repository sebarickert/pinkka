import { Link, createFileRoute } from '@tanstack/react-router'
import { Heading } from '@/components/Heading'
import { RegisterForm } from '@/components/RegisterForm'

export const Route = createFileRoute('/register')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="w-full max-w-md mx-auto grid gap-8">
      <Heading level="h1">Create account</Heading>
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
