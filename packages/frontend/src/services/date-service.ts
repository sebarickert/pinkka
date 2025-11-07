import { DateTime } from 'luxon'

export const DATE_FORMAT = {
  DAY_MONTH_YEAR: 'dd.MM.yyyy', // 25.05.2025
  DAY_MONTH_YEAR_LONG: 'dd.MM.yyyy, HH:mm', // 25.05.2025, 14:30
  MONTH_YEAR_LONG: 'LLLL yyyy', // May 2025
  DAY_MONTH_YEAR_PRETTY: 'd LLL, yyyy', // 5 May, 2025
  INPUT: "yyyy-MM-dd'T'HH:mm", // 2025-05-25T14:30
  MONTH_DAY_LONG: 'LLLL d', // October 31
  MONTH_DAY_YEAR_LONG: 'LLLL d, yyyy', // October 31, 2025
} as const

export const DateService = {
  formatDate({
    date,
    format = 'DAY_MONTH_YEAR',
  }: {
    date?: string
    format?: keyof typeof DATE_FORMAT
  }): string {
    const dt = date ? DateTime.fromISO(date) : DateTime.local()
    return dt.toLocal().toFormat(DATE_FORMAT[format])
  },
  now(): DateTime {
    return DateTime.local()
  },
}
