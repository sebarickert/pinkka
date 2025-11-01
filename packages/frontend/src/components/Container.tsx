import type { FC, JSX, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  children: ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export const Container: FC<Props> = ({
  children,
  className,
  as: Component = 'div',
}) => (
  <Component className={cn('mx-auto max-w-7xl px-4 sm:px-10', className)}>
    {children}
  </Component>
)
