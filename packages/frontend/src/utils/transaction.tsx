import type { TransactionDto } from '@pinkka/schemas/transaction-dto'

export const TRANSACTION_TYPE_LABEL_MAPPING: Record<
  TransactionDto['type'],
  string
> = {
  income: 'Income',
  expense: 'Expense',
  transfer: 'Transfer',
}
