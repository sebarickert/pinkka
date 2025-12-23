import type { FC, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  children: string
  description?: string
  hideLabel?: boolean
}

export const Input: FC<Props> = ({
  className,
  children,
  description,
  hideLabel,
  ...rest
}) => {
  return (
    <div className={cn(className, 'grid')}>
      <label
        className={cn('leading-none pb-3', { 'sr-only': hideLabel })}
        htmlFor={rest.id}
      >
        {children}
      </label>
      <input
        {...rest}
        className="theme-field block w-full py-2 px-4 h-14 text-base/7"
        placeholder={hideLabel ? (children as string) : undefined}
        aria-describedby={description && `${rest.id}-description`}
      />
      {description && (
        <p
          id={`${rest.id}-description`}
          className="text-sm text-muted-foreground mt-3"
        >
          {description}
        </p>
      )}
    </div>
  )
}
