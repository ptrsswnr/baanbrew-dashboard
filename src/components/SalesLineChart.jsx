import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { addMovingAverage, formatCurrency, formatThaiDateShort } from '../lib/metrics'

function SalesLineChart({ data }) {
  const chartData = addMovingAverage(data)

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-4 text-base font-semibold text-slate-800">ยอดขายรายวัน</h2>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tickFormatter={formatThaiDateShort} tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} width={90} />
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            labelFormatter={(label) => `วันที่ ${formatThaiDateShort(label)}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="total"
            name="ยอดขายรายวัน"
            stroke="#0ea5e9"
            strokeWidth={1.5}
            strokeOpacity={0.35}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="avg7"
            name="ค่าเฉลี่ย 7 วัน"
            stroke="#0369a1"
            strokeWidth={2.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SalesLineChart
