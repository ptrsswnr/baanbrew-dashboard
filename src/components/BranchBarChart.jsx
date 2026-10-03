import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency, formatShortCurrency, formatPercent } from '../lib/metrics'
import { branchColor } from '../lib/theme'
import ChartTooltip from './ChartTooltip'

// Cell overrides the slice's fill per row, but Recharts' default tooltip payload doesn't
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

// โดนัท + รายการสาขา: คลิกที่สาขาเพื่อกรองทั้งหน้า (เดิมเป็นแท่งแนวนอน)
function BranchBarChart({ data, onBranchClick }) {
  const total = data.reduce((sum, d) => sum + d.total, 0)

  return (
    <div className="h-full rounded-lg bg-bg-surface p-4 shadow-card sm:p-6">
      <h2 className="mb-2 text-lg leading-7 font-bold text-ink">ยอดขายแยกสาขา</h2>
      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="branch"
              innerRadius={62}
              outerRadius={95}
              paddingAngle={3}
              cornerRadius={6}
              stroke="none"
              onClick={(entry) => onBranchClick?.(entry.branch)}
              cursor={onBranchClick ? 'pointer' : 'default'}
            >
              {data.map((entry) => (
                <Cell key={entry.branch} fill={branchColor(entry.branch)} name={entry.branch} />
              ))}
            </Pie>
            <Tooltip content={<BranchTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-ink-muted">รวม</span>
          <span className="text-xl font-bold tabular-nums text-ink">{formatShortCurrency(total)}</span>
        </div>
      </div>

      <ul className="mt-3 space-y-1">
        {data.map((d) => (
          <li key={d.branch}>
            <button
              type="button"
              onClick={() => onBranchClick?.(d.branch)}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-bg-page focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
            >
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: branchColor(d.branch) }} />
              <span className="text-ink-muted">{d.branch}</span>
              <span className="ml-auto font-semibold tabular-nums text-ink">{formatShortCurrency(d.total)}</span>
              <span className="w-12 text-right text-xs tabular-nums text-ink-muted">{formatPercent(d.total / total)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default BranchBarChart
