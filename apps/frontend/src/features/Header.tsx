import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { UserMenu } from '@/features/UserMenu'
import { DesktopNavigation } from '@/features/DesktopNavigation'
import { cn } from '@/lib/utils'
import { CreateTransactionDialog } from '@/features/transaction/CreateTransactionDialog'
import { financialAccountsQueryOptions } from '@/queries/financial-accounts'

export const Header = () => {
  const accounts = useSuspenseQuery(financialAccountsQueryOptions)

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/85 backdrop-blur z-(--z-header)">
      <Container
        className={cn(
          'h-14 px-0',
          'max-lg:flex max-lg:justify-end',
          'lg:grid lg:grid-cols-[1fr_auto_auto_auto]',
        )}
      >
        <DesktopNavigation className="max-lg:hidden" />
        <CreateTransactionDialog>
          <Button
            disabled={accounts.data.length === 0}
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
