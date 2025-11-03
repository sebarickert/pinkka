import {
  ChartNoAxesCombined,
  CreditCard,
  HandCoins,
  Landmark,
  Wallet,
} from 'lucide-react'
import type { FinancialAccountDto } from '@pinkka/schemas/financial-account-dto'

export const ACCOUNT_TYPE_LABEL_MAPPING: Record<
  FinancialAccountDto['type'],
  string
> = {
  bank: 'Bank',
  credit_card: 'Credit Card',
  wallet: 'Wallet',
  investment: 'Investment',
  loan: 'Loan',
}

export const getFinancialAccountIcon = (type: FinancialAccountDto['type']) => {
  switch (type) {
    case 'credit_card':
      return <CreditCard />
    case 'bank':
      return <Landmark />
    case 'wallet':
      return <Wallet />
    case 'investment':
      return <ChartNoAxesCombined />
    case 'loan':
    default:
      return <HandCoins />
  }
}
