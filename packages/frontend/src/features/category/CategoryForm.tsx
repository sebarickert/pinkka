import * as z from 'zod'
import { useForm, useStore } from '@tanstack/react-form'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { transactionTypeSchema } from '@pinkka/schemas/transaction-dto'
import type { CategoryDto } from '@pinkka/schemas/category-dto'
import type { FC } from 'react'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import { TRANSACTION_TYPE_LABEL_MAPPING } from '@/utils/transaction'

const CATEGORY_TYPE_OPTIONS = Object.keys(transactionTypeSchema.enum).map(
  (type) => ({
    label:
      TRANSACTION_TYPE_LABEL_MAPPING[
        type as keyof typeof TRANSACTION_TYPE_LABEL_MAPPING
      ],
    value: type,
  }),
)

export const CategoryFormSchema = z.object({
  name: z.string().min(1),
  type: transactionTypeSchema,
})

export type CategoryFormSchema = z.infer<typeof CategoryFormSchema>

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
  category?: CategoryDto
  hasTransactions?: boolean
  onSuccess: (category: CategoryDto) => void
  mutationFn: (data: CategoryFormSchema) => Promise<CategoryDto>
  isLoadingTransactionLinks?: boolean
}

export const CategoryForm: FC<Props> = ({
  category,
  hasTransactions,
  onSuccess,
  mutationFn,
  isLoadingTransactionLinks,
}) => {
  const MODE = category ? 'edit' : 'create'
  const [error, setError] = useState<string | null>(null)

  const defaultValues = {
    name: category?.name || '',
    type: category?.type || 'income',
  }

  const mutation = useMutation({
    mutationFn,
    onSuccess,
    onError: (err) => setError(err.message),
  })

  const form = useForm({
    defaultValues,
    validators: {
      onMount: CategoryFormSchema,
      onChange: CategoryFormSchema,
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
      currentValues.type !== defaultValues.type
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
                options={CATEGORY_TYPE_OPTIONS}
                disabled={isLoadingTransactionLinks || hasTransactions}
                isLoading={isLoadingTransactionLinks}
                onChange={(event) => {
                  field.handleChange(
                    event.target
                      .value as keyof typeof transactionTypeSchema.enum,
                  )
                }}
              >
                Type
              </Select>
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
