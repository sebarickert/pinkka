import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { FC } from 'react'
import type { FinancialAccountDto } from '@pinkka/schemas/financial-account-dto'
import type { AccountFormSchema } from '@/features/financial-account/AccountForm'
import { AccountForm } from '@/features/financial-account/AccountForm'
import { Button } from '@/components/Button'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { FinancialAccountService } from '@/services/financial-account-service'
import { financialAccountKeys } from '@/queries/financial-accounts'

export const CreateAccountDialog: FC = () => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const handleSuccess = (newAccount: FinancialAccountDto) => {
    queryClient.setQueryData(
      financialAccountKeys.lists(),
      (old: Array<FinancialAccountDto> = []) => [...old, newAccount],
    )
    setOpen(false)
  }

  const handleMutation = async (data: AccountFormSchema) => {
    const newAccount = {
      name: data.name,
      type: data.type,
      initialBalance: data.balance,
    }

    return FinancialAccountService.create(newAccount)
  }

  return (
    <ResponsiveDialog
      open={open}
      setOpen={setOpen}
      title="Create New Account"
      description="Fill in the details below to create a new account."
      trigger={
        <Button
          type="button"
          size="large"
          accentColor="secondary"
          className="w-full"
        >
          <Plus /> Create Account
        </Button>
      }
    >
      <AccountForm onSuccess={handleSuccess} mutationFn={handleMutation} />
    </ResponsiveDialog>
  )
}
