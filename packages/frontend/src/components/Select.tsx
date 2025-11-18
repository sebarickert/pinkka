import { Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FC, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Option = {
  value: string
  label: string
}

type Props = InputHTMLAttributes<HTMLSelectElement> & {
  children: string
  options: Array<Option>
  isLoading?: boolean
  hideLabel?: boolean
  icon?: LucideIcon
}

export const Select: FC<Props> = ({
  className,
  children,
  options,
  isLoading,
  hideLabel,
  icon: Icon,
  placeholder,
  ...rest
}) => {
  return (
    <div className={cn(className, 'grid')}>
      <label
        className={cn('leading-none inline-flex gap-2 items-center pb-3', {
          'sr-only': hideLabel,
        })}
        htmlFor={rest.id}
      >
        {children}
        {isLoading && <Loader2 className="animate-spin size-5" />}
      </label>
      <div
        className={cn(
          'grid grid-cols-[calc(var(--spacing)*12)_1fr] isolate',
          '[&>svg]:z-10 [&>svg]:row-start-1 [&>svg]:col-start-1 [&>svg]:place-self-center [&>svg]:text-muted-foreground',
          '*:data-[slot="control"]:col-span-2 *:data-[slot="control"]:row-start-1 *:data-[slot="control"]:col-start-1',
          '[&>svg+[data-slot="control"]]:pl-12',
        )}
      >
        {Icon && <Icon />}
        <select
          {...rest}
          className="theme-field block w-full py-2 px-4 h-14 text-base/7 invalid:text-muted-foreground"
          data-slot="control"
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
