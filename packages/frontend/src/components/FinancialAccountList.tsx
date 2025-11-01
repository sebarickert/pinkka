import {
  ChartNoAxesCombined,
  CreditCard,
  HandCoins,
  Landmark,
  Wallet,
} from 'lucide-react'
import type { FinancialAccountDto } from '@pinkka/schemas/financial-account-dto'
import type { FC } from 'react'
import { formatCurrency } from '@/utils/format-currency'
import { List } from '@/components/List'

type Props = {
  accounts: Array<FinancialAccountDto>
}

const ACCOUNT_TYPE_ORDER: Array<FinancialAccountDto['type']> = [
  'bank',
  'wallet',
  'credit_card',
  'loan',
  'investment',
]

export const FinancialAccountList: FC<Props> = ({ accounts }) => {
  const accountsByType = Object.groupBy(accounts, (account) => account.type)

  return (
    <div>
      <List label="Accounts">
        {ACCOUNT_TYPE_ORDER.map((type) =>
          accountsByType[type]
            ?.toSorted((a, b) => a.name.localeCompare(b.name))
            .map((account) => (
              <FinancialAccountListItem key={account.id} account={account} />
            )),
        )}
      </List>
    </div>
  )
}

const getFinancialAccountIcon = (type: FinancialAccountDto['type']) => {
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

const FinancialAccountListItem: FC<{ account: FinancialAccountDto }> = ({
  account,
}) => {
  return (
    <div className="p-4 gap-4 bg-layer flex items-center">
      <span className="shrink-0">{getFinancialAccountIcon(account.type)}</span>
      <span>
        <span className="sr-only">Account name</span>
        {account.name}
      </span>
      <span className="ml-auto font-medium">
        <span className="sr-only">Account balance</span>
        <span>{formatCurrency(account.balance)}</span>
      </span>
    </div>
  )
}
