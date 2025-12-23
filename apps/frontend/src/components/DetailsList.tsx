import { useId } from 'react'
import type { FC } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Heading } from '@/components/Heading'

export interface DetailsItem {
  Icon?: LucideIcon
  label: string
  description: string | React.ReactNode
}

interface Props {
  className?: string
  items: Array<DetailsItem>
  label?: string | React.ReactNode
}

export const DetailsList: FC<Props> = ({ className, items, label }) => {
  const headingId = useId()

  return (
    <div className={cn('grid gap-3', className)}>
      {label && (
        <Heading id={headingId} className="font-medium">
          {label}
        </Heading>
      )}
      <dl
        className={cn('grid gap-4')}
        aria-labelledby={label ? headingId : undefined}
      >
        {items.map((item) => (
          <div
            key={item.label}
            className="grid grid-cols-[auto_1fr] gap-2 items-center"
          >
            <dt className="inline-flex items-center gap-2">
              {item.Icon && <item.Icon />}
              <span>{item.label}</span>
            </dt>
            <dd className="font-medium text-right truncate">
              <span>{item.description}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
