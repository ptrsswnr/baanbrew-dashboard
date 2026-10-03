import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber } from '../lib/metrics'
import { branchColor } from '../lib/theme'
import ChartTooltip from './ChartTooltip'

function BranchMemberTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <ChartTooltip
      active={active}
      payload={[{ dataKey: 'count', name: row.branch, color: branchColor(row.branch), value: row.count }]}
      valueFormatter={(value) => `${formatNumber(value)} คน`}
    />
  )
}

function CustomerBranchChart({ data }) {
  return (
    <div className="h-full rounded-lg bg-bg-surface p-4 shadow-card sm:p-6">
      <h2 className="mb-4 text-lg leading-7 font-bold text-ink">สมาชิกแยกตามสาขาที่สมัคร</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="branch" tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }} tickLine={false} axisLine={{ stroke: 'var(--color-border)' }} />
          <YAxis tickFormatter={formatNumber} tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }} width={50} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: 'var(--color-bg-page)' }} content={<BranchMemberTooltip />} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.branch} fill={branchColor(entry.branch)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CustomerBranchChart
