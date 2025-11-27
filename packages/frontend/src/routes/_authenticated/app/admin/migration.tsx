import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm, useStore } from '@tanstack/react-form'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import { Heading } from '@/components/Heading'
import { TwoColumnLayout } from '@/components/TwoColumnLayout'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/app/admin/migration')({
  component: RouteComponent,
})

const MigrationFormSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, { message: 'File is required' }),
})

const defaultValues = {
  file: undefined as File | undefined,
}

function RouteComponent() {
  const navigate = useNavigate()
  const form = useForm({
    defaultValues,
    validators: {
      onChange: MigrationFormSchema,
    },
    async onSubmit({ value }) {
      const file = value.file

      if (!file) return

      const formData = new FormData()
      formData.append('document', file)

      const response = await fetch(
        `http://localhost:3000/api/migrations/financer`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        },
      )

      if (!response.ok) {
        console.error('Error uploading file')
        return
      }

      navigate({ to: '/app/home' })
    },
  })

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting)

  return (
    <TwoColumnLayout
      main={
        <div className="grid gap-6">
          <Heading as="h1">Migration</Heading>
          <form
            onSubmit={async (event) => {
              event.preventDefault()
              event.stopPropagation()
              await form.handleSubmit()
            }}
          >
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
                      field.handleChange(file)
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
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              <span className={cn(isSubmitting && 'sr-only')}>
                {isSubmitting ? 'Migrating' : 'Migrate'}
              </span>
            </Button>
          </form>
        </div>
      }
    />
  )
}
