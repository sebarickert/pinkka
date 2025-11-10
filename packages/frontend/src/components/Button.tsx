import type { ButtonHTMLAttributes, FC } from 'react'
import { cn } from '@/lib/utils'

export type ButtonAccentColor = 'primary' | 'secondary' | 'danger' | 'ghost'

export type BaseButtonProps = {
  size?: 'default' | 'icon' | 'large'
  accentColor?: ButtonAccentColor
}

export const BUTTON_STYLES = {
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

export function getButtonClasses({
  size = 'default',
  accentColor = 'primary',
  className,
}: {
  size?: 'default' | 'icon' | 'large'
  accentColor?: ButtonAccentColor
  className?: string
}) {
  return cn(
    BUTTON_STYLES.base,
    size === 'default' && BUTTON_STYLES.default,
    size === 'large' && BUTTON_STYLES.large,
    size === 'icon' && BUTTON_STYLES.icon,
    accentColor === 'primary' && 'button-primary',
    accentColor === 'secondary' && 'button-secondary',
    accentColor === 'ghost' && 'button-ghost',
    accentColor === 'danger' && 'button-danger',
    className,
  )
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & BaseButtonProps

export const Button: FC<Props> = ({
  children,
  className,
  size = 'default',
  accentColor = 'primary',
  ...rest
}) => {
  const classes = getButtonClasses({ size, accentColor, className })

  return (
    <button {...rest} className={classes}>
      {children}
    </button>
  )
}
