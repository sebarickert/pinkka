import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FC } from 'react'
import { cn } from '@/lib/utils'
import { NAVIGATION_ITEMS } from '@/constants/navigation'
import { CreateTransactionDialog } from '@/features/transaction/CreateTransactionDialog'

type Props = {
  className?: string
}

export const MobileNavigation: FC<Props> = ({ className }) => {
  return (
    <nav
      className={cn(
        'bg-layer/85 backdrop-blur',
        'fixed left-0 right-0 bottom-0 z-(--z-navigation)',
        'h-14 grid grid-cols-2',
        '*:w-full *:h-full *:flex *:flex-col *:justify-center *:items-center',
        className,
      )}
      aria-label="Main navigation"
    >
      <NavigationItem {...NAVIGATION_ITEMS.home} />
      <CreateTransactionDialog>
        <button
          type="button"
          className={cn(
            'focus-visible:focus-highlight text-muted-foreground',
            'transition-colors',
            'focus-visible:ring-inset',
          )}
        >
          <Plus />
          <span className="sr-only">Create</span>
        </button>
      </CreateTransactionDialog>
    </nav>
  )
}

const NavigationItem: FC<{ href: string; title: string; icon: LucideIcon }> = ({
  href,
  title,
  icon: Icon,
}) => {
  return (
    <Link
      to={href}
      className={cn(
        'text-muted-foreground',
        'aria-[current=page]:text-foreground transition-colors',
        'focus-visible:ring-inset',
      )}
      title={title}
      activeOptions={{ exact: true }}
    >
      <Icon />
      <span className="sr-only">{title}</span>
    </Link>
  )
}
