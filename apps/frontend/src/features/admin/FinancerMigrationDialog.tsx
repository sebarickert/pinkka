import { useState } from 'react'
import { Upload } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import type { FC } from 'react'
import type { MigrationFormSchema } from '@/features/admin/FinancerMigrationForm'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/Button'
import { FinancerMigrationForm } from '@/features/admin/FinancerMigrationForm'
import { AdminService } from '@/services/admin-service'
import { transactionKeys } from '@/queries/transactions'
import { financialAccountKeys } from '@/queries/financial-accounts'
import { categoryKeys } from '@/queries/categories'
import { DetailsList } from '@/components/DetailsList'

type Props = {
  user: { id: string; name: string; email: string }
}

export const FinancerMigrationDialog: FC<Props> = ({ user }) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: transactionKeys.all })
    queryClient.invalidateQueries({ queryKey: financialAccountKeys.all })
    queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    setOpen(false)
  }

  const handleMutation = async (data: MigrationFormSchema) => {
    const formData = new FormData()
    formData.append('document', data.file)

    return AdminService.migrateFinancerData({ userId: user.id, formData })
  }

  return (
    <ResponsiveDialog
      open={open}
      setOpen={setOpen}
      title="Upload Financer Data for User"
      description="Upload the Financer data file to migrate the user's financial data into the system."
      trigger={
        <Button type="button" accentColor="ghost" size="icon" aria-label="Edit">
          <Upload className="size-5" />
        </Button>
      }
    >
      <DetailsList
        items={[
          { label: 'Name', description: user.name },
          { label: 'Email', description: user.email },
        ]}
      />
      <FinancerMigrationForm
        onSuccess={handleSuccess}
        mutationFn={handleMutation}
      />
    </ResponsiveDialog>
  )
}
