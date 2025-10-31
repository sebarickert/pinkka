import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/Button'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="text-center">
      <Button type="button" onClick={async () => await authClient.signOut()}>
        Sign Out
      </Button>
    </div>
  )
}
