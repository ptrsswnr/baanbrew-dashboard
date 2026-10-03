import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { addMovingAverage, formatShortCurrency, formatThaiDateShort } from '../lib/metrics'
import ChartTooltip from './ChartTooltip'

function SalesLineChart({ data }) {
  const chartData = addMovingAverage(data)

  return (
    <div className="h-full rounded-lg bg-bg-surface p-4 shadow-sm ring-1 ring-border sm:p-6">
      <h2 className="mb-4 text-lg leading-7 font-bold text-ink">ยอดขายรายวัน</h2>
      <div className="h-[220px] sm:h-[320px] lg:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatThaiDateShort}
            tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border)' }}
          />
          <YAxis
            tickFormatter={formatShortCurrency}
            tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }}
            width={56}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={
              <ChartTooltip
                labelFormatter={(label) => `วันที่ ${formatThaiDateShort(label)}`}
                valueFormatter={(value) => formatShortCurrency(value)}
              />
            }
          />
          <Legend wrapperStyle={{ fontSize: 13, color: 'var(--color-ink-muted)' }} />
          <Line
            type="monotone"
            dataKey="total"
            name="ยอดขายรายวัน"
            stroke="#7dd3fc"
            strokeWidth={1.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="avg7"
            name="ค่าเฉลี่ย 7 วัน"
            stroke="var(--color-brand)"
            strokeWidth={2.5}
            dot={false}
          />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default SalesLineChart
