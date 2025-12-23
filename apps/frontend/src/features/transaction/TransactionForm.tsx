import * as z from 'zod'
import { useForm, useStore } from '@tanstack/react-form'
import { ArrowDown, ArrowUp, Loader2, Tags } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { transactionTypeSchema } from '@pinkka/schemas/transaction-dto'
import type {
  TransactionDetailDto,
  TransactionDto,
  TransactionType,
} from '@pinkka/schemas/transaction-dto'
import type { financialAccountTypesSchema } from '@pinkka/schemas/financial-account-dto'
import type { FC } from 'react'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import { DateService } from '@/services/date-service'
import { financialAccountsQueryOptions } from '@/queries/financial-accounts'
import { TransactionTypeSwitcher } from '@/features/transaction/TransactionTypeSwitcher'
import { categoriesQueryOptions } from '@/queries/categories'

const BaseTransactionFormSchema = z.object({
  type: transactionTypeSchema,
  description: z.string().min(1),
  amount: z.number().positive(),
  date: z.string(),
  categoryId: z.string(),
})

const IncomeTransactionFormSchema = BaseTransactionFormSchema.extend({
  toAccountId: z.string().min(1, 'To account is required'),
})

const ExpenseTransactionFormSchema = BaseTransactionFormSchema.extend({
  fromAccountId: z.string().min(1, 'From account is required'),
})

const TransferTransactionFormSchema = BaseTransactionFormSchema.extend({
  fromAccountId: z.string().min(1, 'From account is required'),
  toAccountId: z.string().min(1, 'To account is required'),
})

function getTransactionFormSchemaByType(type: TransactionType) {
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
  type: TransactionType,
  transaction?: TransactionDetailDto,
) {
  const baseDefaultValues = {
    type,
    description: transaction?.description || '',
    // NaN to make field empty if no amount is provided
    amount: transaction?.amount || NaN,
    date: DateService.formatDate({ date: transaction?.date, format: 'INPUT' }),
    categoryId: transaction?.categoryId || '',
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
  onSuccess: (transaction: TransactionDto | TransactionDetailDto) => void
  mutationFn: (
    data: TransactionFormSchema,
  ) => Promise<TransactionDto | TransactionDetailDto>
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
  // @todo: add loaders to form, so before categories are loaded, show a spinner
  const { data: categories } = useQuery(categoriesQueryOptions)
  const [transactionType, setTransactionType] = useState(
    transaction?.type || 'expense',
  )

  const hasCategories = categories?.some(({ type }) => type === transactionType)

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
      onChange: TransactionFormSchema,
    },
    async onSubmit({ value }) {
      await mutation.mutateAsync(value)
    },
  })

  const isTouched = useStore(form.store, (state) => state.isTouched)
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
      hasFromAccountIdChanged ||
      currentValues.categoryId !== defaultValues.categoryId
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
      <div aria-live="polite" aria-atomic>
        {error && (
          <div className="bg-layer mb-8 text-sm p-4 text-center border rounded-md">
            <span>{error}</span>
          </div>
        )}
      </div>
      <fieldset className="grid gap-4" disabled={isSubmitting}>
        {MODE === 'create' && (
          <form.Field name="type">
            {(field) => {
              return (
                <TransactionTypeSwitcher
                  transactionType={transactionType}
                  name={field.name}
                  id={field.name}
                  onChange={(event) => {
                    const newType = event.target.value as TransactionType
                    setTransactionType(newType)
                    form.reset(getDefaultValuesByType(newType, transaction))
                  }}
                />
              )
            }}
          </form.Field>
        )}
        <form.Field name="amount">
          {(field) => {
            return (
              <Input
                hideLabel
                id={field.name}
                name={field.name}
                type="number"
                min={0.01}
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
                  hideLabel
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  required
                  placeholder="From Account"
                  options={ACCOUNT_OPTIONS}
                  icon={ArrowUp}
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
                  hideLabel
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  required
                  icon={ArrowDown}
                  placeholder="To Account"
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
        <form.Field name="description">
          {(field) => {
            return (
              <Input
                hideLabel
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
                Description
              </Input>
            )
          }}
        </form.Field>
        {hasCategories && (
          <form.Field name="categoryId">
            {(field) => {
              const categoryOptions = [
                { value: '', label: 'No category' },
                ...(categories
                  ?.filter(({ type }) => type === transactionType)
                  .map((category) => ({
                    label: category.name,
                    value: category.id,
                  })) || []),
              ]

              return (
                <Select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  hideLabel
                  icon={Tags}
                  options={categoryOptions}
                  onChange={(event) => {
                    field.handleChange(event.target.value)
                  }}
                >
                  Category
                </Select>
              )
            }}
          </form.Field>
        )}
        <form.Field name="date">
          {(field) => {
            return (
              <Input
                hideLabel
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
          !isTouched ||
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
