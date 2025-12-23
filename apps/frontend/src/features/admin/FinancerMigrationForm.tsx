import { useForm, useStore } from '@tanstack/react-form'
import { Loader2 } from 'lucide-react'
import * as z from 'zod'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { FC } from 'react'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { cn } from '@/lib/utils'

export const MigrationFormSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, { message: 'File is required' }),
})

export type MigrationFormSchema = z.infer<typeof MigrationFormSchema>

const defaultValues = {
  file: undefined as unknown as File,
}

type Props = {
  onSuccess: () => void
  mutationFn: (data: MigrationFormSchema) => Promise<void>
}

export const FinancerMigrationForm: FC<Props> = ({ onSuccess, mutationFn }) => {
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn,
    onSuccess,
    onError: (err) => setError(err.message),
  })

  const form = useForm({
    defaultValues,
    validators: {
      onChange: MigrationFormSchema,
    },
    async onSubmit({ value }) {
      await mutation.mutateAsync(value)
    },
  })

  const isTouched = useStore(form.store, (state) => state.isTouched)
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting)

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
      <fieldset disabled={isSubmitting}>
        <form.Field
          name="file"
          children={(field) => (
            <Input
              id={field.name}
              name={field.name}
              type="file"
              onBlur={field.handleBlur}
              required
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  field.handleChange(file)
                }
              }}
            >
              File
            </Input>
          )}
        />
      </fieldset>
      <Button
        type="submit"
        size="large"
        className="w-full mt-10"
        disabled={!isTouched || isSubmitting}
      >
        {isSubmitting && <Loader2 className="animate-spin" />}
        <span className={cn(isSubmitting && 'sr-only')}>
          {isSubmitting ? 'Migrating' : 'Migrate'}
        </span>
      </Button>
    </form>
  )
}
