import { addDays } from '../lab3/time'

function buildPresets(max) {
  if (!max) return []
  // ใช้ addDays (คำนวณแบบ UTC) แทน toISOString เพื่อไม่ให้วันที่ไทยเพี้ยนไป 1 วัน
  const daysBack = (n) => addDays(max, -(n - 1))
  const yearStart = `${max.slice(0, 4)}-01-01`
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
      <div className="flex gap-1 rounded-full bg-bg-page p-1">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            aria-pressed={isActivePreset(preset.range)}
            onClick={() => onChange(preset.range)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              isActivePreset(preset.range) ? 'bg-brand-strong text-white shadow-sm' : 'text-ink-muted hover:text-ink'
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
          className="rounded-full border border-border bg-bg-page px-3 py-1.5 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
          className="rounded-full border border-border bg-bg-page px-3 py-1.5 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
      </label>
      {hasFilter && (
        <button
          type="button"
          onClick={() => onChange({ from: '', to: '' })}
          className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-muted underline-offset-2 hover:text-brand-strong hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          ล้างตัวกรองวันที่
        </button>
      )}
    </div>
  )
}

export default DateRangeFilter
