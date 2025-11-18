import type { TransactionType } from '@pinkka/schemas/transaction-dto'
import type { ChangeEvent, FC } from 'react'
import { cn } from '@/lib/utils'
import { getTransactionIcon } from '@/utils/transaction'

type Props = {
  name: string
  id: string
  transactionType: TransactionType
  onChange: (value: ChangeEvent<HTMLInputElement>) => void
}

const FIELDS = [
  { value: 'transfer', label: 'Transfer' },
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
]

export const TransactionTypeSwitcher: FC<Props> = ({
  name,
  id,
  transactionType,
  onChange,
}) => {
  return (
    <div className={cn('grid items-center justify-center grid-cols-3')}>
      {FIELDS.map(({ value, label }) => (
        <label>
          <input
            type="radio"
            name={name}
            id={id}
            defaultChecked={transactionType === value}
            value={value}
            onChange={onChange}
            className={cn('peer sr-only')}
          />
          <span
            className={cn(
              'flex items-center justify-center py-2 h-14',
              'peer-checked:bg-layer peer-checked:hover:bg-layer peer-checked:active:bg-layer',
              'peer-focus-visible:focus-highlight peer-focus-visible:ring-inset peer-hover:cursor-pointer peer-hover:bg-accent peer-active:bg-accent',
            )}
          >
            {getTransactionIcon(value as TransactionType)}
            <span className="sr-only">{label}</span>
          </span>
        </label>
      ))}
    </div>
  )
}
