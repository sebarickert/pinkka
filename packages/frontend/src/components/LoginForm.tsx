import { useState } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import * as z from 'zod'
import { CircleX, Loader2 } from 'lucide-react'
import type { FC } from 'react'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Separator } from '@/components/Separator'
import { SocialLogins } from '@/components/SocialLogins'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'

const LoginFormSchema = z.object({
  email: z.email(),
  password: z.string(),
})

const defaultValues = {
  email: '',
  password: '',
}

export const LoginForm: FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  )

  const form = useForm({
    defaultValues,
    validators: {
      onChange: LoginFormSchema,
    },
    async onSubmit({ value }) {
      const { error } = await authClient.signIn.email({
        ...value,
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      globalThis.location.href = '/app/home'
    },
  })

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting)

  return (
    <div className="grid gap-8">
      <SocialLogins />
      <Separator>OR</Separator>
      <form
        onSubmit={async (event) => {
          event.preventDefault()
          event.stopPropagation()
          await form.handleSubmit()
        }}
      >
        <div aria-live="polite">
          {errorMessage && (
            <div className="bg-layer py-4 px-4 flex gap-4 border mb-8">
              <CircleX className="shrink-0 h-lh" />
              <p>{errorMessage}</p>
            </div>
          )}
        </div>
        <fieldset className="grid gap-6" disabled={isSubmitting}>
          <form.Field
            name="email"
            children={(field) => {
              return (
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  required
                  onChange={(event) => {
                    field.handleChange(event.target.value)
                  }}
                >
                  Email
                </Input>
              )
            }}
          />
          <form.Field
            name="password"
            children={(field) => {
              return (
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  required
                  onChange={(event) => {
                    field.handleChange(event.target.value)
                  }}
                >
                  Password
                </Input>
              )
            }}
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
            {isSubmitting ? 'Logging in' : 'Log in'}
          </span>
        </Button>
      </form>
    </div>
  )
}
