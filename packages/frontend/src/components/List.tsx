import { Children, useId } from 'react'
import type { FC } from 'react'
import { cn } from '@/lib/utils'
import { Heading } from '@/components/Heading'

interface ListProps {
  children: React.ReactNode | Array<React.ReactNode>
  className?: string
  itemRoundness?: boolean
  label?: string
}

export const List: FC<ListProps> = ({
  label,
  children,
  className,
  itemRoundness = true,
}) => {
  const headingId = useId()

  return (
    <section className={cn(className)}>
      {label && (
        <Heading id={headingId} className="mb-3 font-medium">
          {label}
        </Heading>
      )}
      <ul
        data-slot="list"
        className={cn('grid divide-y', {})}
        aria-labelledby={label ? headingId : undefined}
      >
        {Children.map(children, (child) => {
          return (
            child && (
              <li
                data-slot="list-item"
                className={cn(
                  '[&>*:focus-visible]:ring-inset',
                  itemRoundness && 'first:[&>:not(style)]:rounded-t-md',
                  itemRoundness && 'last:[&>:not(style)]:rounded-b-md',
                )}
              >
                {child}
              </li>
            )
          )
        })}
      </ul>
    </section>
  )
}
