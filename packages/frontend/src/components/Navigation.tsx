import { Link } from '@tanstack/react-router'
import clsx from 'clsx'
import { History, Home, Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FC } from 'react'
import { cn } from '@/lib/utils'

const NAVIGATION_ITEMS = {
  home: {
    href: '/app/home',
    title: 'Home',
    icon: Home,
  },
  activity: {
    href: '/app/activity',
    title: 'Activity',
    icon: History,
  },
}

export const Navigation: FC = () => {
  return (
    <nav
      className={clsx(
        'bg-layer/85 backdrop-blur',
        'fixed left-0 right-0 bottom-0 z-(--z-navigation)',
        'h-14 grid grid-cols-3',
        '*:w-full *:h-full *:flex *:flex-col *:justify-center *:items-center',
      )}
    >
      <NavigationItem {...NAVIGATION_ITEMS.home} />
      <button
        type="button"
        className={cn(
          'focus-visible:focus-highlight text-muted-foreground',
          'transition-colors',
        )}
      >
        <Plus />
        <span className="sr-only">Create</span>
      </button>
      <NavigationItem {...NAVIGATION_ITEMS.activity} />
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
        'focus-visible:focus-highlight text-muted-foreground',
        'aria-[current=page]:text-foreground transition-colors',
      )}
      title={title}
      activeOptions={{ exact: true }}
    >
      <Icon />
      <span className="sr-only">{title}</span>
    </Link>
  )
}
