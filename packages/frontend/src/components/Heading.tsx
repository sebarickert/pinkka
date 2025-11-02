import type { FC, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4'

type Props = HTMLAttributes<HTMLHeadingElement> & {
  level?: HeadingLevel
  children: string | React.ReactNode
}

export const Heading: FC<Props> = ({
  level = 'h2',
  children,
  className = '',
  ...rest
}) => {
  const HeadingType = level

  return (
    <HeadingType
      className={cn(className, {
        'text-lg': level !== 'h1',
        'text-3xl/tight': level === 'h1',
      })}
      {...rest}
    >
      {children}
    </HeadingType>
  )
}
