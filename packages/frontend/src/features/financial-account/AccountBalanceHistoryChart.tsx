import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import type { FC } from 'react'
import type { TransactionDto } from '@pinkka/schemas/transaction-dto'
import {
  accountYearTransactionsQueryOptions,
  getAllTransactionsByAccountOptions,
} from '@/queries/transactions'
import { DateService } from '@/services/date-service'
import { constructBalanceChartData } from '@/utils/financial-account'
import { AreaChart } from '@/components/AreaChart'
import { Button } from '@/components/Button'
import { EmptyAccountBalanceHistoryChart } from '@/features/financial-account/EmptyAccountBalanceHistoryChart'

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

  const [timeframe, setTimeframe] = useState<'YTD' | 'ALL'>('YTD')
  const [data, setChartData] = useState<Array<TransactionDto>>(YTD)

  const { data: ALL } = useQuery({
    ...getAllTransactionsByAccountOptions({ accountId }),
    enabled: timeframe === 'ALL',
  })

  const chartData = constructBalanceChartData({
    data,
    accountId: accountId,
    currentBalance,
  })

  const hasEnoughYTD =
    constructBalanceChartData({
      data: YTD,
      accountId,
      currentBalance,
    }).length > 2

  const hasEnoughALL = ALL
    ? constructBalanceChartData({
        data: ALL,
        accountId,
        currentBalance,
      }).length > 2
    : false

  useEffect(() => {
    if (timeframe === 'YTD' && !hasEnoughYTD && hasEnoughALL) {
      setTimeframe('ALL')
      setChartData(ALL || [])
      return
    }

    if (timeframe === 'YTD') {
      setChartData(YTD)
    } else if (ALL) {
      setChartData(ALL)
    }
  }, [timeframe, hasEnoughYTD, hasEnoughALL, YTD, ALL])

  return (
    <div className="grid gap-4">
      {chartData.length > 2 ? (
        <AreaChart data={chartData} />
      ) : (
        <EmptyAccountBalanceHistoryChart />
      )}
      <div className="inline-flex items-center gap-2">
        <Button
          onClick={() => setTimeframe('YTD')}
          accentColor="secondary"
          disabled={!hasEnoughYTD || timeframe === 'YTD'}
        >
          YTD
        </Button>
        <Button
          onClick={() => setTimeframe('ALL')}
          accentColor="secondary"
          disabled={!hasEnoughALL || timeframe === 'ALL'}
        >
          ALL
        </Button>
      </div>
    </div>
  )
}
