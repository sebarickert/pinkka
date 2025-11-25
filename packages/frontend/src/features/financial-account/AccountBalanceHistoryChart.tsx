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

  useEffect(() => {
    if (timeframe === 'YTD') {
      setChartData(YTD)
    }

    if (timeframe === 'ALL' && ALL) {
      setChartData(ALL)
    }
  }, [timeframe, YTD, ALL])

  const chartData = constructBalanceChartData({
    data,
    accountId: accountId,
    currentBalance,
  })

  return (
    <div className="grid gap-4">
      <AreaChart data={chartData} />
      <div className="inline-flex items-center gap-2">
        <Button onClick={() => setTimeframe('YTD')} accentColor="secondary">
          YTD
        </Button>
        <Button onClick={() => setTimeframe('ALL')} accentColor="secondary">
          ALL
        </Button>
      </div>
    </div>
  )
}
