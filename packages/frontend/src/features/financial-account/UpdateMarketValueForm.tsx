import * as z from 'zod'
import { useForm, useStore } from '@tanstack/react-form'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { FC } from 'react'
import type { TransactionDto } from '@pinkka/schemas/transaction-dto'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import { DateService } from '@/services/date-service'

export const UpdateMarketValueFormSchema = z.object({
  currentMarketValue: z.number(),
  date: z.string(),
})

export type UpdateMarketValueFormSchema = z.infer<
  typeof UpdateMarketValueFormSchema
>

const BUTTON_LABEL_MAPPING = {
  default: 'Update',
  submitting: 'Updating...',
}

type Props = {
  currentBalance: number
  onSuccess: (account: TransactionDto) => void
  mutationFn: (data: UpdateMarketValueFormSchema) => Promise<TransactionDto>
}

export const UpdateMarketValueForm: FC<Props> = ({
  currentBalance,
  onSuccess,
  mutationFn,
}) => {
  const [error, setError] = useState<string | null>(null)

  const defaultValues = {
    currentMarketValue: currentBalance,
    date: DateService.formatDate({ format: 'INPUT' }),
  }

  const mutation = useMutation({
    mutationFn,
    onSuccess,
    onError: (err) => setError(err.message),
  })

  const form = useForm({
    defaultValues,
    validators: {
      onChange: UpdateMarketValueFormSchema,
    },
    async onSubmit({ value }) {
      await mutation.mutateAsync(value)
    },
  })

  const isTouched = useStore(form.store, (state) => state.isTouched)
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting)
  const canSubmit = useStore(form.store, (state) => state.canSubmit)
  const hasMarketValueChanged = useStore(form.store, (state) => {
    const currentValues = state.values
    return currentValues.currentMarketValue !== defaultValues.currentMarketValue
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
        <form.Field name="currentMarketValue">
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
                onChange={(event) => {
                  field.handleChange(Number(event.target.value))
                }}
              >
                Current Market Value
              </Input>
            )
          }}
        </form.Field>
        <form.Field name="date">
          {(field) => {
            return (
              <Input
                id={field.name}
                name={field.name}
                type="datetime-local"
                value={field.state.value}
                onBlur={field.handleBlur}
                required
                onChange={(event) => {
                  field.handleChange(event.target.value)
                }}
              >
                Date
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
          !isTouched || isSubmitting || !canSubmit || !hasMarketValueChanged
        }
      >
        {isSubmitting && <Loader2 className="animate-spin" />}
        <span className={cn(isSubmitting && 'sr-only')}>
          {isSubmitting
            ? BUTTON_LABEL_MAPPING.submitting
            : BUTTON_LABEL_MAPPING.default}
        </span>
      </Button>
    </form>
  )
}
