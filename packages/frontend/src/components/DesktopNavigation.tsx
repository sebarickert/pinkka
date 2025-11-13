import { Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import type { FC } from 'react'
import { cn } from '@/lib/utils'
import { NAVIGATION_ITEMS } from '@/constants/navigation'

type Props = {
  className?: string
}

export const DesktopNavigation: FC<Props> = ({ className }) => {
  return (
    <nav
      className={cn('inline-flex items-center', className)}
      aria-label="Main navigation"
    >
      <NavigationItem {...NAVIGATION_ITEMS.home} />
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
        'aria-[current=page]:bg-layer',
        '[&:has(svg)]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0',
        'focus-visible:ring-inset',
        'inline-flex items-center justify-center',
        'text-center py-2 px-4 h-14 text-sm',
        'button-ghost text-foreground!',
      )}
      title={title}
      activeOptions={{ exact: true }}
    >
      <Icon />
      <span>{title}</span>
    </Link>
  )
}
