import * as z from 'zod'
import { useForm, useStore } from '@tanstack/react-form'
import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { financialAccountTypesSchema } from '@pinkka/schemas/financial-account-dto'
import type {
  TransactionDetailDto,
  transactionTypeSchema,
} from '@pinkka/schemas/transaction-dto'
import type { FC } from 'react'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import { DateService } from '@/services/date-service'
import { financialAccountsQueryOptions } from '@/queries/financial-accounts'

const BaseTransactionFormSchema = z.object({
  description: z.string(),
  amount: z.number().positive(),
  date: z.string(),
  // @todo: Implement when backend returns categories via transaction dto
  // categoryId: z.string().optional(),
})

const IncomeTransactionFormSchema = BaseTransactionFormSchema.extend({
  toAccountId: z.string(),
})

const ExpenseTransactionFormSchema = BaseTransactionFormSchema.extend({
  fromAccountId: z.string(),
})

const TransferTransactionFormSchema = BaseTransactionFormSchema.extend({
  fromAccountId: z.string(),
  toAccountId: z.string(),
})

function getTransactionFormSchemaByType(
  type: z.infer<typeof transactionTypeSchema>,
) {
  switch (type) {
    case 'income':
      return IncomeTransactionFormSchema
    case 'expense':
      return ExpenseTransactionFormSchema
    case 'transfer':
    default:
      return TransferTransactionFormSchema
  }
}

function getDefaultValuesByType(
  type: z.infer<typeof transactionTypeSchema>,
  transaction?: TransactionDetailDto,
) {
  const baseDefaultValues = {
    description: transaction?.description || '',
    amount: transaction?.amount || 0,
    date: DateService.formatDate({ date: transaction?.date, format: 'INPUT' }),
    // @todo: Implement when backend returns categories via transaction dto
    // categoryId: '',
  }

  switch (type) {
    case 'income':
      return {
        ...baseDefaultValues,
        toAccountId: transaction?.toAccountId || '',
      }
    case 'expense':
      return {
        ...baseDefaultValues,
        fromAccountId: transaction?.fromAccountId || '',
      }
    case 'transfer':
    default:
      return {
        ...baseDefaultValues,
        fromAccountId: transaction?.fromAccountId || '',
        toAccountId: transaction?.toAccountId || '',
      }
  }
}

export type BaseTransactionFormSchema = z.infer<
  typeof BaseTransactionFormSchema
>

export type IncomeTransactionFormSchema = z.infer<
  typeof IncomeTransactionFormSchema
>

export type ExpenseTransactionFormSchema = z.infer<
  typeof ExpenseTransactionFormSchema
>

export type TransferTransactionFormSchema = z.infer<
  typeof TransferTransactionFormSchema
>

export type TransactionFormSchema =
  | IncomeTransactionFormSchema
  | ExpenseTransactionFormSchema
  | TransferTransactionFormSchema

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
  transaction?: TransactionDetailDto
  onSuccess: (transaction: TransactionDetailDto) => void
  mutationFn: (data: TransactionFormSchema) => Promise<TransactionDetailDto>
}

export const TransactionForm: FC<Props> = ({
  transaction,
  onSuccess,
  mutationFn,
}) => {
  const MODE = transaction ? 'edit' : 'create'
  const [error, setError] = useState<string | null>(null)
  // @todo: add loaders to form, so before accounts are loaded, show a spinner
  const { data: accounts } = useQuery(financialAccountsQueryOptions)
  const [transactionType, setTransactionType] = useState(
    transaction?.type || 'expense',
  )

  const TransactionFormSchema = getTransactionFormSchemaByType(transactionType)
  const defaultValues = getDefaultValuesByType(transactionType, transaction)

  const ACCOUNT_OPTIONS = useMemo(
    () =>
      accounts?.map((account) => ({
        label: account.name,
        value: account.id,
      })) || [],
    [accounts],
  )

  const mutation = useMutation({
    mutationFn,
    onSuccess,
    onError: (err) => setError(err.message),
  })

  const form = useForm({
    defaultValues,
    validators: {
      onMount: TransactionFormSchema,
      onChange: TransactionFormSchema,
    },
    async onSubmit({ value }) {
      await mutation.mutateAsync(value)
    },
  })

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting)
  const canSubmit = useStore(form.store, (state) => state.canSubmit)
  const hasFormUpdatedValues = useStore(form.store, (state) => {
    const currentValues = state.values

    const hasToAccountIdChanged =
      (transactionType === 'income' || transactionType === 'transfer') &&
      'toAccountId' in currentValues &&
      'toAccountId' in defaultValues &&
      currentValues.toAccountId !== defaultValues.toAccountId

    const hasFromAccountIdChanged =
      (transactionType === 'expense' || transactionType === 'transfer') &&
      'fromAccountId' in currentValues &&
      'fromAccountId' in defaultValues &&
      currentValues.fromAccountId !== defaultValues.fromAccountId

    return (
      currentValues.description !== defaultValues.description ||
      currentValues.amount !== defaultValues.amount ||
      currentValues.date !== defaultValues.date ||
      hasToAccountIdChanged ||
      hasFromAccountIdChanged
      // currentValues.categoryId !== defaultValues.categoryId || --- IGNORE ---
    )
  })

  const TRANSFER_SAME_ACCOUNT_ERROR =
    'Please select different accounts for From and To'

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
        <form.Field name="amount">
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
                Amount
              </Input>
            )
          }}
        </form.Field>
        {(transactionType === 'transfer' || transactionType === 'expense') && (
          <form.Field
            name="fromAccountId"
            validators={
              transactionType === 'transfer'
                ? {
                    onChangeListenTo: ['toAccountId'],
                    onChange: ({ value, fieldApi }) => {
                      if (
                        value === fieldApi.form.getFieldValue('toAccountId')
                      ) {
                        setError(TRANSFER_SAME_ACCOUNT_ERROR)
                        return
                      }

                      setError(null)
                    },
                  }
                : undefined
            }
          >
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
                  From Account
                </Select>
              )
            }}
          </form.Field>
        )}
        {(transactionType === 'transfer' || transactionType === 'income') && (
          <form.Field
            name="toAccountId"
            validators={
              transactionType === 'transfer'
                ? {
                    onChangeListenTo: ['fromAccountId'],
                    onChange: ({ value, fieldApi }) => {
                      if (
                        value === fieldApi.form.getFieldValue('fromAccountId')
                      ) {
                        setError(TRANSFER_SAME_ACCOUNT_ERROR)
                        return
                      }

                      setError(null)
                      return
                    },
                  }
                : undefined
            }
          >
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
                  To Account
                </Select>
              )
            }}
          </form.Field>
        )}
        {/* @todo: Implement when backend returns categories via transaction dto */}
        {/* <form.Field name="categoryId">
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
                Category
              </Select>
            )
          }}
        </form.Field> */}
        <form.Field name="description">
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
