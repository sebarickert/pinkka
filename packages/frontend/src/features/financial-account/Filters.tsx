import { Link, useParams, useSearch } from '@tanstack/react-router'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { DateTime } from 'luxon'
import { DateService } from '@/services/date-service'
import { cn } from '@/lib/utils'

export const Filters = () => {
  const params = useParams({ from: '/_authenticated/app/accounts/$accountId' })
  const search = useSearch({ from: '/_authenticated/app/accounts/$accountId' })

  const currentDate = DateTime.fromObject({
    month: search.month,
    year: search.year,
  }).toLocal()

  const previous = currentDate.minus({ months: 1 })
  const next = currentDate.plus({ months: 1 })

  return (
    <div
      className={cn(
        'inline-flex items-center',
        '*:h-11 *:w-11 *:inline-flex *:items-center *:justify-center *:-mb-2',
      )}
    >
      <Link
        to="/app/accounts/$accountId"
        params={{ accountId: params.accountId }}
        search={{
          month: previous.month,
          year: previous.year,
        }}
        resetScroll={false}
      >
        <span className="sr-only">Previous month</span>
        <ChevronLeft />
      </Link>
      <Link
        to="/app/accounts/$accountId"
        params={{ accountId: params.accountId }}
        search={{
          month: DateService.now().month,
          year: DateService.now().year,
        }}
        resetScroll={false}
      >
        <span className="sr-only">Current month</span>
        <Calendar />
      </Link>
      <Link
        to="/app/accounts/$accountId"
        params={{ accountId: params.accountId }}
        search={{
          month: next.month,
          year: next.year,
        }}
        resetScroll={false}
      >
        <span className="sr-only">Next month</span>
        <ChevronRight />
      </Link>
    </div>
  )
}
