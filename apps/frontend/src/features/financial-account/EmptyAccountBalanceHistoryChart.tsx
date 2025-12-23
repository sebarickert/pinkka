import type { FC } from 'react'
import { AreaChart } from '@/components/AreaChart'
import { cn } from '@/lib/utils'
import { Heading } from '@/components/Heading'

export const EmptyAccountBalanceHistoryChart: FC = () => {
  const dummyChartData = [
    { time: '2023-01-01', value: 0 },
    { time: '2023-02-01', value: -100 },
    { time: '2023-03-01', value: 1000 },
    { time: '2023-04-01', value: 5000 },
    { time: '2023-05-01', value: 3000 },
    { time: '2023-06-01', value: 10000 },
  ]

  return (
    <div className="relative overflow-hidden">
      <div className="opacity-15">
        <AreaChart data={dummyChartData} isDummy />
      </div>
      <div className="absolute flex justify-center items-center inset-0">
        <div
          className={cn(
            'text-center text-pretty',
            'py-12 px-6 md:px-12',
            'bg-layer/75',
          )}
        >
          <div
            className={cn(
              'flex max-w-sm flex-col items-center gap-2 text-center',
            )}
          >
            <Heading>Not enough data</Heading>
            <span className={cn('text-muted-foreground text-sm/relaxed')}>
              There is not enough data to display the chart. Please add more
              transactions to see the balance history.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
