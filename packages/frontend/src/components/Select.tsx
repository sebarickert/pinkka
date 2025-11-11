import { Loader2 } from 'lucide-react'
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
}

export const Select: FC<Props> = ({
  className,
  children,
  options,
  isLoading,
  ...rest
}) => {
  return (
    <div className={cn(className, 'grid')}>
      <label
        className="leading-none inline-flex gap-2 items-center pb-3"
        htmlFor={rest.id}
      >
        {children}
        {isLoading && <Loader2 className="animate-spin size-5" />}
      </label>
      <select
        {...rest}
        className="theme-field block w-full py-2 px-4 h-14 text-base/7"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
