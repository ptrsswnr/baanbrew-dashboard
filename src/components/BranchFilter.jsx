function BranchFilter({ branches, value, onChange }) {
  const options = [{ branch: null, label: 'ทุกสาขา' }, ...branches.map((branch) => ({ branch, label: branch }))]
  return (
    <div
      role="group"
      aria-label="กรองตามสาขา"
      className="flex snap-x gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
    >
      {options.map(({ branch, label }) => {
        const active = branch === value
        return (
          <button
            key={label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(branch)}
            className={`h-9 shrink-0 snap-start rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong ${
              active
                ? 'border-brand-strong bg-brand-strong text-white'
                : 'border-border bg-bg-surface text-ink-muted hover:bg-brand-tint'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export default BranchFilter
