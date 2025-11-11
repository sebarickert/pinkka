import { ArrowDown, ArrowDownUp, ArrowUp } from 'lucide-react'
import type { TransactionDto } from '@pinkka/schemas/transaction-dto'

export const TRANSACTION_TYPE_LABEL_MAPPING: Record<
  TransactionDto['type'],
  string
> = {
  income: 'Income',
  expense: 'Expense',
  transfer: 'Transfer',
}

export const getAmountAbbreviation = (type: TransactionDto['type']) => {
  switch (type) {
    case 'income':
      return '+'
    case 'expense':
      return '-'
    default:
      return ''
  }
}

export const getTransactionIcon = (type: TransactionDto['type']) => {
  switch (type) {
    case 'income':
      return <ArrowDown />
    case 'expense':
      return <ArrowUp />
    case 'transfer':
    default:
      return <ArrowDownUp />
  }
}
