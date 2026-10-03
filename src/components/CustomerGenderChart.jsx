import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatNumber } from '../lib/metrics'
import ChartTooltip from './ChartTooltip'

const COLORS = ['var(--color-brand)', '#f472b6', 'var(--color-ink-muted)']

function CustomerGenderChart({ data }) {
  return (
    <div className="h-full rounded-lg bg-bg-surface p-4 shadow-sm ring-1 ring-border sm:p-6">
      <h2 className="mb-4 text-lg leading-7 font-bold text-ink">สมาชิกแยกตามเพศ</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="gender" innerRadius={60} outerRadius={90} paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={entry.gender} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip valueFormatter={(value) => `${formatNumber(value)} คน`} />} />
          <Legend wrapperStyle={{ fontSize: 13, color: 'var(--color-ink-muted)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CustomerGenderChart
