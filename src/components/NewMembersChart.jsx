import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber } from '../lib/metrics'
import ChartTooltip from './ChartTooltip'

function NewMembersChart({ data }) {
  return (
    <div className="h-full rounded-lg bg-bg-surface p-4 shadow-sm ring-1 ring-border sm:p-6">
      <h2 className="mb-4 text-lg leading-7 font-bold text-ink">สมาชิกใหม่รายเดือน</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }} tickLine={false} axisLine={{ stroke: 'var(--color-border)' }} />
          <YAxis tickFormatter={formatNumber} tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }} width={50} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: 'var(--color-bg-page)' }}
            content={<ChartTooltip valueFormatter={(value) => `${formatNumber(value)} คน`} />}
          />
          <Bar dataKey="count" name="สมาชิกใหม่" fill="var(--color-brand)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default NewMembersChart
