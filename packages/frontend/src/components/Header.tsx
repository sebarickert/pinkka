import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { UserMenu } from '@/components/UserMenu'
import { DesktopNavigation } from '@/components/DesktopNavigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'
import { CreateTransactionDialog } from '@/features/transaction/CreateTransactionDialog'

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-background/85 backdrop-blur z-(--z-header)">
      <Container
        className={cn(
          'grid h-14 px-0',
          'max-lg:grid-cols-[1fr_auto] lg:grid-cols-[auto_1fr_auto_auto]',
        )}
      >
        <Link
          to="/app/home"
          className="size-14 inline-flex items-center justify-center focus-visible:ring-inset"
        >
          <Logo className="size-9" />
        </Link>
        <DesktopNavigation className="max-lg:hidden" />
        <CreateTransactionDialog>
          <Button
            type="button"
            accentColor="ghost"
            size="large"
            className="text-foreground! text-sm! focus-visible:ring-inset max-lg:hidden"
          >
            <Plus />
            Create
          </Button>
        </CreateTransactionDialog>
        <UserMenu />
      </Container>
    </header>
  )
}
