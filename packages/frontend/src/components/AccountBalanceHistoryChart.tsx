import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { FC } from 'react'
import type { TransactionDto } from '@pinkka/schemas/transaction-dto'
import { accountYearTransactionsQueryOptions } from '@/queries/transactions'
import { DateService } from '@/services/date-service'
import { constructBalanceChartData } from '@/utils/financial-account'
import { AreaChart } from '@/components/AreaChart'

type Props = {
  accountId: string
  currentBalance: number
}

export const AccountBalanceHistoryChart: FC<Props> = ({
  accountId,
  currentBalance,
}) => {
  const { data: YTD } = useSuspenseQuery(
    accountYearTransactionsQueryOptions({
      accountId: accountId,
      year: DateService.now().year,
    }),
  )

  const [data, setChartData] = useState<Array<TransactionDto>>(YTD)

  const chartData = constructBalanceChartData({
    data,
    accountId: accountId,
    currentBalance,
  })

  return <AreaChart data={chartData} />
}
