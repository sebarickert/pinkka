import type { FC } from 'react'
import { cn } from '@/lib/utils'
import { Heading } from '@/components/Heading'

type Props = {
  title: string
  description: string
  children?: React.ReactNode
  className?: string
}

export const InfoMessageBlock: FC<Props> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col gap-6 items-center justify-center',
        'text-center text-pretty',
        'py-12 px-6 md:px-12',
        'bg-layer/75',
        className,
      )}
    >
      <div
        className={cn('flex max-w-sm flex-col items-center gap-2 text-center')}
      >
        <Heading>{title}</Heading>
        <span className={cn('text-muted-foreground text-sm/relaxed')}>
          {description}
        </span>
      </div>
      {children}
    </div>
  )
}
