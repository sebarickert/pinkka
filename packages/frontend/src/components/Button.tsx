import type { ButtonHTMLAttributes, FC } from 'react'
import { cn } from '@/lib/utils'

export type ButtonAccentColor = 'primary' | 'secondary' | 'danger' | 'ghost'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string
  size?: 'default' | 'icon' | 'large'
  accentColor?: ButtonAccentColor
}

export const Button: FC<Props> = ({
  href,
  children,
  className,
  size = 'default',
  accentColor = 'primary',
  ...rest
}) => {
  const buttonStyles = {
    base: cn(
      'text-sm/6 text-center',
      'focus-visible:focus-highlight whitespace-nowrap cursor-pointer',
      'inline-flex items-center justify-center',
      '[&:has(svg)]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0',
      'disabled:pointer-events-none disabled:opacity-50',
    ),
    default: cn('py-2.5 px-4'),
    large: cn('py-2 px-4 h-14 text-base/7'),
    icon: cn('h-11 w-11'),
  }

  const buttonClasses = cn(
    buttonStyles.base,
    size === 'default' && buttonStyles.default,
    size === 'large' && buttonStyles.large,
    size === 'icon' && buttonStyles.icon,
    accentColor === 'primary' && 'button-primary',
    accentColor === 'secondary' && 'button-secondary',
    accentColor === 'ghost' && 'button-ghost',
    accentColor === 'danger' && 'button-danger',
    className,
  )

  if (href) {
    return (
      <a href={href} className={buttonClasses}>
        {children}
      </a>
    )
  }

  return (
    <button {...rest} className={buttonClasses}>
      {children}
    </button>
  )
}
