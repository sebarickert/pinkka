import { Link } from '@tanstack/react-router'
import { LogOut, UserRound } from 'lucide-react'
import { useId, useState } from 'react'
import { useClickAway } from '@uidotdev/usehooks'
import type { FC } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'

export const UserMenu = () => {
  const userMenuId = useId()
  const buttonId = useId()
  const [isOpen, setIsOpen] = useState(false)

  const ref = useClickAway<HTMLDivElement>(({ target }) => {
    const element = target as HTMLElement | null
    if (element?.getAttribute('id') === buttonId) return
    setIsOpen(false)
  })

  const handleLogout = async () => {
    await authClient.signOut()
    window.location.href = '/'
  }

  return (
    <div className="relative inline-flex">
      <button
        id={buttonId}
        aria-label="Open user navigation menu"
        aria-expanded={isOpen}
        aria-controls={userMenuId}
        aria-haspopup="true"
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        className={cn(
          'size-14 inline-flex items-center justify-center',
          'cursor-pointer',
          'focus-visible:focus-highlight hover:ring-2 ring-inset hover:ring-blue transition-shadow',
        )}
      >
        {/* <button
        type="button"
        className="size-14 inline-flex items-center justify-center"
      > */}
        <UserRound />
      </button>
      <div
        aria-hidden={!isOpen}
        id={userMenuId}
        ref={ref}
        className={cn(
          'transition-discrete transition-all',
          'starting:opacity-0 starting:-translate-y-4',
          'aria-hidden:hidden aria-hidden:opacity-0',
          'z-50 min-w-32 overflow-hidden rounded-md p-1 shadow-md w-56',
          'border bg-layer',
          'absolute top-[calc(100%+var(--spacing))] right-0',
        )}
      >
        {/* <div role="group">
          <UserMenuItem href="/u/resumes" icon={File}>
            Resumes
          </UserMenuItem>
        </div>
        <div role="separator" className="h-px my-1 -mx-1 bg-background" />
        <div role="group">
          <UserMenuItem href="/u/settings" icon={Settings}>
            Settings
          </UserMenuItem>
          <UserMenuItem href="/u/subscription" icon={CreditCard}>
            Subscription
          </UserMenuItem>
          <UserMenuItem href="/u/support" icon={LifeBuoy}>
            Support
          </UserMenuItem>
        </div> */}
        <div role="separator" className="h-px my-1 -mx-1 bg-background" />
        <UserMenuItem onClick={handleLogout} icon={LogOut}>
          Log out
        </UserMenuItem>
      </div>
    </div>
  )
}

const UserMenuItem: FC<
  {
    children: string
    icon: LucideIcon
  } & (
    | { href: string; onClick?: never }
    | {
        href?: never
        onClick: () => void
      }
  )
> = ({ href, children, icon: Icon, onClick }) => {
  const classes = cn(
    'flex w-full items-center gap-2 text-sm cursor-pointer py-1.5 px-2 rounded-sm',
    'focus-visible:focus-highlight hover:bg-accent',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    'text-muted-foreground hover:text-foreground',
  )

  const content = (
    <>
      <Icon />
      <span>{children}</span>
    </>
  )

  if (onClick) {
    return (
      <button onClick={onClick} type="button" className={classes}>
        {content}
      </button>
    )
  }

  return (
    <Link to={href} className={classes}>
      {content}
    </Link>
  )
}
