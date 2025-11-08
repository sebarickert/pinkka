import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import type { FinancialAccountDto } from '@pinkka/schemas/financial-account-dto'
import type { FC } from 'react'
import { formatCurrency } from '@/utils/format-currency'
import { List } from '@/components/List'
import { financialAccountsQueryOptions } from '@/queries/financial-accounts'
import { getFinancialAccountIcon } from '@/utils/financial-account'
import { CreateAccountDialog } from '@/features/financial-account/CreateAccountDialog'

const ACCOUNT_TYPE_ORDER: Array<FinancialAccountDto['type']> = [
  'bank',
  'wallet',
  'credit_card',
  'loan',
  'investment',
]

export const FinancialAccountList: FC = () => {
  const { data: accounts } = useSuspenseQuery(financialAccountsQueryOptions)
  const accountsByType = Object.groupBy(accounts, (account) => account.type)

  return (
    <div className="grid gap-2">
      <List label="Accounts">
        {ACCOUNT_TYPE_ORDER.map((type) =>
          accountsByType[type]
            ?.toSorted((a, b) => a.name.localeCompare(b.name))
            .map((account) => (
              <FinancialAccountListItem key={account.id} account={account} />
            )),
        )}
      </List>
      <CreateAccountDialog />
    </div>
  )
}

const FinancialAccountListItem: FC<{ account: FinancialAccountDto }> = ({
  account,
}) => {
  return (
    <Link
      to="/app/accounts/$accountId"
      params={{ accountId: account.id }}
      className="p-4 gap-4 bg-layer flex items-center hover:bg-accent"
    >
      <span className="shrink-0">{getFinancialAccountIcon(account.type)}</span>
      <span>
        <span className="sr-only">Account name</span>
        {account.name}
      </span>
      <span className="ml-auto font-medium">
        <span className="sr-only">Account balance</span>
        <span>{formatCurrency(account.balance)}</span>
      </span>
    </Link>
  )
}
