import { useMemo } from 'react'
import type { FC } from 'react'
import type { FinancialAccountDto } from '@pinkka/schemas/financial-account-dto'
import { Button } from '@/components/Button'
import { ACCOUNT_TYPE_LABEL_MAPPING } from '@/utils/financial-account'
import { formatCurrency } from '@/utils/format-currency'
import { DetailsList } from '@/components/DetailsList'
import { EditAccountDialog } from '@/features/financial-account/EditAccountDialog'
import { DeleteAccountDialog } from '@/features/financial-account/DeleteAccountDialog'

type Props = {
  account: FinancialAccountDto
}

export const FinancialAccountSidebar: FC<Props> = ({ account }) => {
  const accountDetails = useMemo(() => {
    return [
      {
        label: 'Type',
        description: ACCOUNT_TYPE_LABEL_MAPPING[account.type],
      },
      {
        label: 'Balance',
        description: formatCurrency(account.balance),
      },
    ]
  }, [account])

  return (
    <aside>
      <div className="grid gap-8">
        <DetailsList label="Account Details" items={accountDetails} />
        <div className="grid gap-4">
          <EditAccountDialog account={account} />
          {account.type === 'investment' && (
            <Button
              type="button"
              accentColor="secondary"
              className="w-full"
              size="large"
            >
              Update Market Value
            </Button>
          )}
          <DeleteAccountDialog account={account} />
        </div>
      </div>
    </aside>
  )
}
