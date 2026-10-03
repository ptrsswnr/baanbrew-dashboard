import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency, formatShortCurrency } from '../lib/metrics'
import { branchColor } from '../lib/theme'
import ChartTooltip from './ChartTooltip'

// Cell overrides the bar's fill per row, but Recharts' default tooltip payload doesn't
// reflect that per-cell color, so the tooltip rebuilds its payload from the hovered row.
function BranchTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <ChartTooltip
      active={active}
      payload={[{ dataKey: 'total', name: row.branch, color: branchColor(row.branch), value: row.total }]}
      valueFormatter={(value) => formatCurrency(value)}
    />
  )
}

function BranchBarChart({ data, onBranchClick }) {
  return (
    <div className="h-full rounded-lg bg-bg-surface p-4 shadow-sm ring-1 ring-border sm:p-6">
      <h2 className="mb-4 text-lg leading-7 font-bold text-ink">ยอดขายแยกสาขา</h2>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 56, left: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="branch" width={90} tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: 'var(--color-bg-page)' }} content={<BranchTooltip />} />
          <Bar
            dataKey="total"
            radius={[0, 6, 6, 0]}
            onClick={(entry) => onBranchClick?.(entry.branch)}
            cursor={onBranchClick ? 'pointer' : 'default'}
            label={{ position: 'right', formatter: (value) => formatShortCurrency(value), fill: 'var(--color-ink)', fontSize: 12 }}
          >
            {data.map((entry) => (
              <Cell key={entry.branch} fill={branchColor(entry.branch)} name={entry.branch} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BranchBarChart
