import { useState } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import * as z from 'zod'
import { Check, CircleX, Loader2 } from 'lucide-react'
import type { FC } from 'react'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/Input'
import { Separator } from '@/components/Separator'
import { SocialLogins } from '@/components/SocialLogins'
import { authClient } from '@/lib/auth-client'

const RegisterFormSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/\d/, 'Must include at least one number')
    .regex(/[^A-Za-z\d]/, 'Must include at least one special character'),
})

const defaultValues = {
  name: '',
  email: '',
  password: '',
}

export const RegisterForm: FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  )

  const form = useForm({
    defaultValues,
    validators: {
      onChange: RegisterFormSchema,
    },
    async onSubmit({ value }) {
      const { error } = await authClient.signUp.email({
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
  const passwordValue = useStore(form.store, (state) => state.values.password)

  const passwordSchema = RegisterFormSchema.shape.password
  const result = passwordSchema.safeParse(passwordValue)

  const hasMinLength = !result.error?.issues.some(
    (issue) => issue.code === 'too_small',
  )
  const hasNumber = !result.error?.issues.some(
    (issue) =>
      issue.code === 'invalid_format' && issue.message.includes('number'),
  )
  const hasSpecialChar = !result.error?.issues.some(
    (issue) =>
      issue.code === 'invalid_format' &&
      issue.message.includes('special character'),
  )

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
            name="name"
            children={(field) => {
              return (
                <Input
                  id={field.name}
                  name={field.name}
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
          />
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
          <ul
            className={cn(
              'text-muted-foreground text-sm *:transition-colors grid gap-2',
              '*:inline-flex *:items-center *:gap-2',
              '*:data-[valid=true]:text-foreground *:data-[valid=true]:[&_svg]:text-green',
            )}
          >
            <li data-valid={hasMinLength}>
              <Check />
              At least 8 characters
            </li>
            <li data-valid={hasNumber}>
              <Check />
              At least one number (0-9)
            </li>
            <li data-valid={hasSpecialChar}>
              <Check />
              At least one special character
            </li>
          </ul>
        </fieldset>
        <Button
          type="submit"
          size="large"
          className="w-full mt-10"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="animate-spin" />}
          <span className={cn(isSubmitting && 'sr-only')}>
            {isSubmitting ? 'Registering' : 'Continue'}
          </span>
        </Button>
      </form>
      <p className="px-6 text-sm text-center text-muted-foreground">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{' '}
        and <a href="#">Privacy Policy</a>.
      </p>
    </div>
  )
}
