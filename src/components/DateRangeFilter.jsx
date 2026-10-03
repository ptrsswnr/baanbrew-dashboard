const oneDayMs = 24 * 60 * 60 * 1000
const toDateStr = (date) => date.toISOString().slice(0, 10)

function buildPresets(max) {
  if (!max) return []
  const maxDate = new Date(max + 'T00:00:00')
  const daysBack = (n) => toDateStr(new Date(maxDate.getTime() - (n - 1) * oneDayMs))
  const yearStart = `${maxDate.getFullYear()}-01-01`
  return [
    { label: '7 วัน', range: { from: daysBack(7), to: max } },
    { label: '30 วัน', range: { from: daysBack(30), to: max } },
    { label: 'ปีนี้', range: { from: yearStart, to: max } },
    { label: 'ทั้งหมด', range: { from: '', to: '' } },
  ]
}

function DateRangeFilter({ min, max, value, onChange }) {
  const presets = buildPresets(max)
  const hasFilter = value.from || value.to
  const isActivePreset = (range) => range.from === value.from && range.to === value.to

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1 rounded-md bg-bg-page p-1">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            aria-pressed={isActivePreset(preset.range)}
            onClick={() => onChange(preset.range)}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong ${
              isActivePreset(preset.range) ? 'bg-bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-1.5 text-sm text-ink-muted">
        ตั้งแต่
        <input
          type="date"
          min={min}
          max={value.to || max}
          value={value.from}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          className="rounded-md border border-border px-2.5 py-1.5 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
        />
      </label>
      <label className="flex items-center gap-1.5 text-sm text-ink-muted">
        ถึง
        <input
          type="date"
          min={value.from || min}
          max={max}
          value={value.to}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          className="rounded-md border border-border px-2.5 py-1.5 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
        />
      </label>
      {hasFilter && (
        <button
          type="button"
          onClick={() => onChange({ from: '', to: '' })}
          className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-muted underline-offset-2 hover:text-brand-strong hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
        >
          ล้างตัวกรองวันที่
        </button>
      )}
    </div>
  )
}

export default DateRangeFilter
