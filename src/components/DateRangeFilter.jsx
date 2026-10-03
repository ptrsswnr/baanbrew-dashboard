function DateRangeFilter({ min, max, value, onChange }) {
  const hasFilter = value.from || value.to

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-1.5 text-sm text-slate-600">
        ตั้งแต่
        <input
          type="date"
          min={min}
          max={value.to || max}
          value={value.from}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
        />
      </label>
      <label className="flex items-center gap-1.5 text-sm text-slate-600">
        ถึง
        <input
          type="date"
          min={value.from || min}
          max={max}
          value={value.to}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
        />
      </label>
      {hasFilter && (
        <button
          type="button"
          onClick={() => onChange({ from: '', to: '' })}
          className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 underline-offset-2 hover:text-sky-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
        >
          ล้างตัวกรองวันที่
        </button>
      )}
    </div>
  )
}

export default DateRangeFilter
