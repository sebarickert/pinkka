import { useForm, useStore } from '@tanstack/react-form'
import { financialAccountTypesSchema } from '@pinkka/schemas/financial-account-dto'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useState } from 'react'
import type { FC } from 'react'
import type {
  FinancialAccountDto,
  UpdateFinancialAccountDto,
} from '@pinkka/schemas/financial-account-dto'
import { Button } from '@/components/Button'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { ACCOUNT_TYPE_LABEL_MAPPING } from '@/utils/financial-account'
import { cn } from '@/lib/utils'
import {
  accountHasTransactionsQueryOptions,
  financialAccountKeys,
} from '@/queries/financial-accounts'
import { FinancialAccountService } from '@/services/financial-account-service'

type Props = {
  account: FinancialAccountDto
}

export const EditAccountDialog: FC<Props> = ({ account }) => {
  const [open, setOpen] = useState(false)

  return (
    <ResponsiveDialog
      open={open}
      setOpen={setOpen}
      title="Update Account Details"
      description="Edit the details for this account. Some fields may be disabled if there are existing transactions."
      trigger={
        <Button
          type="button"
          accentColor="secondary"
          className="w-full"
          size="large"
        >
          Edit
        </Button>
      }
    >
      <EditAccountForm account={account} onSubmit={() => setOpen(false)} />
    </ResponsiveDialog>
  )
}

const AccountFormSchema = z.object({
  name: z.string(),
  type: financialAccountTypesSchema,
  balance: z.number(),
})

const ACCOUNT_OPTIONS = Object.keys(financialAccountTypesSchema.enum).map(
  (type) => ({
    label:
      ACCOUNT_TYPE_LABEL_MAPPING[
        type as keyof typeof ACCOUNT_TYPE_LABEL_MAPPING
      ],
    value: type,
  }),
)

const EditAccountForm: FC<{
  account: FinancialAccountDto
  onSubmit: () => void
}> = ({ account, onSubmit }) => {
  const queryClient = useQueryClient()
  const { data } = useSuspenseQuery(
    accountHasTransactionsQueryOptions(account.id),
  )

  const hasTransactions = Boolean(data)

  const defaultValues = {
    name: account.name,
    type: account.type,
    balance: account.balance,
  }

  const mutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateFinancialAccountDto
    }) => FinancialAccountService.update(id, payload),
    onSuccess: (updatedAccount) => {
      queryClient.setQueryData(
        financialAccountKeys.byId(account.id),
        updatedAccount,
      )

      onSubmit()
    },
  })

  const form = useForm({
    defaultValues,
    validators: {
      onChange: AccountFormSchema,
    },
    onSubmit({ value }) {
      const payload = {
        name: value.name,
        type: value.type,
        ...(hasTransactions ? {} : { initialBalance: value.balance }),
      } satisfies UpdateFinancialAccountDto

      mutation.mutate({ id: account.id, payload })
    },
  })

  const isSubmitting =
    useStore(form.store, (state) => state.isSubmitting) || mutation.isPending
  const hasFormUpdatedValues = useStore(form.store, (state) => {
    const currentValues = state.values
    return (
      currentValues.name !== defaultValues.name ||
      currentValues.type !== defaultValues.type ||
      currentValues.balance !== defaultValues.balance
    )
  })

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault()
        event.stopPropagation()
        await form.handleSubmit()
      }}
    >
      <fieldset className="grid gap-6" disabled={isSubmitting}>
        <form.Field name="name">
          {(field) => {
            return (
              <Input
                id={field.name}
                name={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                required
                onChange={(event) => {
                  field.handleChange(event.target.value)
                }}
              >
                Name
              </Input>
            )
          }}
        </form.Field>
        <form.Field name="type">
          {(field) => {
            return (
              <Select
                id={field.name}
                name={field.name}
                type="number"
                value={field.state.value}
                onBlur={field.handleBlur}
                required
                options={ACCOUNT_OPTIONS}
                onChange={(event) => {
                  field.handleChange(
                    event.target
                      .value as keyof typeof financialAccountTypesSchema.enum,
                  )
                }}
              >
                Type
              </Select>
            )
          }}
        </form.Field>
        <form.Field name="balance">
          {(field) => {
            return (
              <Input
                id={field.name}
                name={field.name}
                type="number"
                step={0.01}
                value={field.state.value}
                onBlur={field.handleBlur}
                required
                disabled={hasTransactions}
                onChange={(event) => {
                  field.handleChange(Number(event.target.value))
                }}
              >
                Balance
              </Input>
            )
          }}
        </form.Field>
      </fieldset>
      <Button
        type="submit"
        size="large"
        className="w-full mt-10"
        disabled={isSubmitting || !hasFormUpdatedValues}
      >
        {isSubmitting && <Loader2 className="animate-spin" />}
        <span className={cn(isSubmitting && 'sr-only')}>
          {isSubmitting ? 'Updating...' : 'Update'}
        </span>
      </Button>
    </form>
  )
}
