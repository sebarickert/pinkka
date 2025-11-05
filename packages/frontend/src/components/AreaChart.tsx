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

    const container = chartContainerRef.current

    const initialWidth = container.clientWidth
    const chart = createChart(container, {
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
        visible: initialWidth >= 700,
      },
      timeScale: {
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      width: initialWidth,
      height: container.clientHeight,
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
    container.appendChild(legend)

    const setTooltipHtml = ({
      date,
      price,
      change,
    }: {
      date: string
      price: string
      change?: number
    }) => {
      legend.innerHTML = `
        <span class="text-3xl/tight font-semibold">${price}</span>
        <span class="text-sm inline-flex items-center gap-1">
          <span class="text-muted-foreground">${date}</span>
          ${change ? `<span class="text-muted-foreground font-medium ${change && change > 0 ? 'text-green!' : 'text-red!'}">(${formatCurrency(change, true)})</span>` : ''}
        </span>
      `
    }

    const updateLegend = (param?: MouseEventParams) => {
      const isHovering =
        param &&
        param.time !== undefined &&
        param.point &&
        param.point.x >= 0 &&
        param.point.y >= 0

      let hoveredIndex: number
      let hoveredPoint: { time: Time; value: number }
      if (isHovering) {
        hoveredIndex = data.findIndex((entry) => entry.time === param.time)
        hoveredPoint = param.seriesData.get(areaSeries) as {
          time: Time
          value: number
        }
      } else {
        hoveredIndex = data.length - 1
        hoveredPoint = areaSeries.dataByIndex(Number.MAX_SAFE_INTEGER, -1) as {
          time: Time
          value: number
        }
      }

      // Calculate change from previous point
      let monthChange: number | undefined = undefined
      if (hoveredIndex > 0) {
        monthChange = hoveredPoint.value - data[hoveredIndex - 1].value
      }

      setTooltipHtml({
        date: DateService.formatDate({
          date: hoveredPoint.time.toString(),
          format: 'DAY_MONTH_YEAR_PRETTY',
        }),
        price: formatCurrency(hoveredPoint.value),
        change: monthChange,
      })
    }

    chart.subscribeCrosshairMove(updateLegend)
    updateLegend(undefined)
    chart.timeScale().fitContent()

    // Use ResizeObserver for more reliable resizing
    const resizeObserver = new window.ResizeObserver(() => {
      const width = container.clientWidth

      chart.applyOptions({
        width,
        height: container.clientHeight,
        rightPriceScale: {
          visible: width >= 700,
        },
      })
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
      legend.remove()
    }
  }, [data])

  return (
    <div
      ref={chartContainerRef}
      data-slot="chart"
      className="relative h-[400px] w-full overflow-hidden"
    />
  )
}
