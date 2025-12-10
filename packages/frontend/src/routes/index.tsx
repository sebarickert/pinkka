import { Link, createFileRoute } from '@tanstack/react-router'
import { ButtonLink } from '@/components/ButtonLink'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="py-32 max-w-[780px] mx-auto px-4 text-center">
      <h1
        className={cn(
          'text-[clamp(2.5em,5vw,5rem)] font-medium leading-none text-balance tracking-tight',
        )}
      >
        Your personal <br /> finances. Simplified.
      </h1>
      <div className="mt-8 grid justify-center gap-4">
        <ButtonLink to="/register" size="large">
          Get Started
        </ButtonLink>
        <Link to="/login" className="underline">
          Log in
        </Link>
      </div>
    </div>
  )
}
