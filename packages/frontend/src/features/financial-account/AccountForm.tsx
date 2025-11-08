import { financialAccountTypesSchema } from '@pinkka/schemas/financial-account-dto'
import * as z from 'zod'
import { useForm, useStore } from '@tanstack/react-form'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { FinancialAccountDto } from '@pinkka/schemas/financial-account-dto'
import type { FC } from 'react'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { ACCOUNT_TYPE_LABEL_MAPPING } from '@/utils/financial-account'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'

const ACCOUNT_OPTIONS = Object.keys(financialAccountTypesSchema.enum).map(
  (type) => ({
    label:
      ACCOUNT_TYPE_LABEL_MAPPING[
        type as keyof typeof ACCOUNT_TYPE_LABEL_MAPPING
      ],
    value: type,
  }),
)

export const AccountFormSchema = z.object({
  name: z.string().min(1),
  type: financialAccountTypesSchema,
  balance: z.number(),
})

export type AccountFormSchema = z.infer<typeof AccountFormSchema>

const BUTTON_LABEL_MAPPING = {
  edit: {
    default: 'Update',
    submitting: 'Updating...',
  },
  create: {
    default: 'Create',
    submitting: 'Creating...',
  },
}

type Props = {
  account?: FinancialAccountDto
  hasTransactions?: boolean
  onSuccess: (account: FinancialAccountDto) => void
  mutationFn: (data: AccountFormSchema) => Promise<FinancialAccountDto>
}

export const AccountForm: FC<Props> = ({
  account,
  hasTransactions,
  onSuccess,
  mutationFn,
}) => {
  const MODE = account ? 'edit' : 'create'
  const [error, setError] = useState<string | null>(null)

  const defaultValues = {
    name: account?.name || '',
    type: account?.type || 'bank',
    balance: account?.balance || 0,
  }

  const mutation = useMutation({
    mutationFn,
    onSuccess,
    onError: (err) => setError(err.message),
  })

  const form = useForm({
    defaultValues,
    validators: {
      onMount: AccountFormSchema,
      onChange: AccountFormSchema,
    },
    async onSubmit({ value }) {
      await mutation.mutateAsync(value)
    },
  })

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting)
  const canSubmit = useStore(form.store, (state) => state.canSubmit)
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
      <div aria-live="polite">
        {error && (
          <div className="bg-layer mb-8 text-sm p-4 text-center border rounded-md">
            <span>{error}</span>
          </div>
        )}
      </div>
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
        disabled={
          isSubmitting ||
          !canSubmit ||
          (MODE === 'edit' && !hasFormUpdatedValues)
        }
      >
        {isSubmitting && <Loader2 className="animate-spin" />}
        <span className={cn(isSubmitting && 'sr-only')}>
          {isSubmitting
            ? BUTTON_LABEL_MAPPING[MODE].submitting
            : BUTTON_LABEL_MAPPING[MODE].default}
        </span>
      </Button>
    </form>
  )
}
