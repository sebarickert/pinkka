import { AreaSeries, ColorType, createChart } from 'lightweight-charts'
import { useEffect, useRef } from 'react'
import type { BarPrice, MouseEventParams, Time } from 'lightweight-charts'
import type { FC } from 'react'
import { formatCurrency } from '@/utils/format-currency'
import { DateService } from '@/services/date-service'

type Props = {
  data: Array<{ time: Time; value: number }>
}

export const AreaChart: FC<Props> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        textColor: 'hsl(0 0% 65%)',
        background: { type: ColorType.Solid, color: 'transparent' },
        attributionLogo: false,
      },
      grid: {
        horzLines: {
          color: 'hsl(0 0% 16%)',
          style: 4,
        },
        vertLines: {
          color: 'hsl(0 0% 16%)',
          style: 4,
        },
      },
      crosshair: {
        horzLine: {
          color: 'hsl(0 0% 65%)',
          labelVisible: false,
        },
        vertLine: {
          color: 'hsl(0 0% 65%)',
          labelVisible: false,
        },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
    })

    const areaSeries = chart.addSeries(AreaSeries, {
      topColor: 'hsl(219 99% 53% / 0.15)',
      bottomColor: 'hsl(219 99% 53% / 0.15)',
      lineColor: 'hsl(219 99% 53%)',
      lineWidth: 2,
      lastValueVisible: false,
      priceLineVisible: false,
      priceFormat: {
        type: 'custom',
        formatter: (price: BarPrice) => formatCurrency(price),
      },
    })

    areaSeries.setData(data)

    const legend = document.createElement('div')
    legend.classList.add('grid', 'absolute', 'left-0', 'top-0', 'z-10')
    legend.style.color = 'white'
    chartContainerRef.current.appendChild(legend)

    const setTooltipHtml = ({
      date,
      price,
    }: {
      date: string
      price: string
    }) => {
      legend.innerHTML = `
        <span class="text-3xl/tight font-semibold">${price}</span>
        <span class="text-muted-foreground text-sm">${date}</span>`
    }

    const updateLegend = (param?: MouseEventParams) => {
      const validCrosshairPoint =
        param &&
        param.time !== undefined &&
        param.point &&
        param.point.x >= 0 &&
        param.point.y >= 0

      const { time, value } = (
        validCrosshairPoint
          ? param.seriesData.get(areaSeries)
          : areaSeries.dataByIndex(Number.MAX_SAFE_INTEGER, -1)
      ) as { time: Time; value: number }

      setTooltipHtml({
        date: DateService.formatDate({
          date: time.toString(),
          format: 'DAY_MONTH_YEAR_PRETTY',
        }),
        price: formatCurrency(value),
      })
    }

    chart.subscribeCrosshairMove(updateLegend)
    updateLegend(undefined)
    chart.timeScale().fitContent()

    const handleResize = () => {
      if (!chartContainerRef.current) return
      chart.applyOptions({ width: chartContainerRef.current.clientWidth })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      legend.remove()
    }
  }, [data])

  return (
    <div
      ref={chartContainerRef}
      data-slot="chart"
      className="relative aspect-video w-full"
    />
  )
}
