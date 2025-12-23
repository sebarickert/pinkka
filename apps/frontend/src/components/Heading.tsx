import type { FC, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4'

type Props = HTMLAttributes<HTMLHeadingElement> & {
  as?: HeadingLevel
  children: string | React.ReactNode
}

export const Heading: FC<Props> = ({
  as = 'h2',
  children,
  className = '',
  ...rest
}) => {
  const HeadingType = as

  return (
    <HeadingType
      className={cn(
        {
          'text-lg': as !== 'h1',
          'text-3xl font-medium': as === 'h1',
        },
        className,
      )}
      {...rest}
    >
      {children}
    </HeadingType>
  )
}
