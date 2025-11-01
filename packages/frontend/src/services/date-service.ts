import { DateTime } from 'luxon'

const DATE_FORMAT = {
  DEFAULT: 'dd.MM.yyyy',
  LONG: 'dd.MM.yyyy, HH:mm',
  //   INPUT: "yyyy-MM-dd'T'HH:mm",
  //   MONTH: 'LLL',
  //   MONTH_LONG: 'LLLL yyyy',
  //   MONTH_WITH_DATE_LONG: 'LLLL d',
  //   MONTH_WITH_YEAR_LONG: 'LLLL yyyy',
  //   MONTH_WITH_DATE_SHORT: 'LLL d',
  //   MONTH_WITH_DATE_SHORT_WITH_YEAR: 'LLL d, yyyy',
  //   YEAR_MONTH: 'yyyy-MM',
} as const

export const DateService = {
  formatDate(
    date: string,
    format: keyof typeof DATE_FORMAT = 'DEFAULT',
  ): string {
    return DateTime.fromISO(date).toFormat(DATE_FORMAT[format])
  },
}
