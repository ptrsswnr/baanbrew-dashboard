// Tooltip ที่ใช้ร่วมกันทุกกราฟ ตาม design.md: การ์ดขาว, label จาง, ค่าตัวหนา, จุดสีต่อ series
function ChartTooltip({ active, payload, label, labelFormatter, valueFormatter }) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-xl bg-bg-surface p-3 shadow-lg ring-1 ring-border">
      {label !== undefined && (
        <p className="mb-1.5 text-xs font-medium text-ink-muted">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey ?? entry.name} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: entry.color }} />
            <span className="text-ink-muted">{entry.name}</span>
            <span className="ml-auto font-semibold tabular-nums text-ink">
              {valueFormatter ? valueFormatter(entry.value, entry) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChartTooltip
