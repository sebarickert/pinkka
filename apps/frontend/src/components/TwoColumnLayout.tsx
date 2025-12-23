import type { FC } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  main: React.ReactNode
  sidebar?: React.ReactNode
}

export const TwoColumnLayout: FC<Props> = ({ main, sidebar }) => {
  return (
    <div
      className={cn(
        'grid max-xl:gap-8 xl:gap-20 w-full',
        'max-xl:max-w-[780px] max-xl:mx-auto',
        'xl:grid-cols-[1fr_360px]',
        'has-[&_[data-slot=breadcrumbs]]:[&>:nth-child(2)]:xl:pt-[52px]',
      )}
    >
      {main}
      {sidebar && sidebar}
    </div>
  )
}
