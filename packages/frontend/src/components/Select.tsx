import type { FC, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Option = {
  value: string
  label: string
}

type Props = InputHTMLAttributes<HTMLSelectElement> & {
  children: string
  options: Array<Option>
}

export const Select: FC<Props> = ({
  className,
  children,
  options,
  ...rest
}) => {
  return (
    <div className={cn(className, 'grid gap-3')}>
      <label className="leading-none" htmlFor={rest.id}>
        {children}
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
