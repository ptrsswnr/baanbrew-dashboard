import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { addMovingAverage, formatShortCurrency, formatThaiDateShort } from '../lib/metrics'
import ChartTooltip from './ChartTooltip'

function SalesLineChart({ data }) {
  const chartData = addMovingAverage(data)

  return (
    <div className="h-full rounded-lg bg-bg-surface p-4 shadow-card sm:p-6">
      <h2 className="mb-4 text-lg leading-7 font-bold text-ink">ยอดขายรายวัน</h2>
      <div className="h-[220px] sm:h-[320px] lg:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ec4d8c" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#ec4d8c" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
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
            <Legend iconType="circle" wrapperStyle={{ fontSize: 13, color: 'var(--color-ink-muted)' }} />
            <Area
              type="monotone"
              dataKey="total"
              name="ยอดขายรายวัน"
              stroke="#ec4d8c"
              strokeWidth={2}
              fill="url(#salesFill)"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="avg7"
              name="ค่าเฉลี่ย 7 วัน"
              stroke="#8250c4"
              strokeWidth={2.5}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default SalesLineChart
