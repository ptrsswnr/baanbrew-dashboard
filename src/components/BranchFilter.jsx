function BranchFilter({ branches, value, onChange }) {
  const options = [{ branch: null, label: 'ทุกสาขา' }, ...branches.map((branch) => ({ branch, label: branch }))]
  return (
    <div role="group" aria-label="กรองตามสาขา" className="flex flex-wrap gap-2">
      {options.map(({ branch, label }) => {
        const active = branch === value
        return (
          <button
            key={label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(branch)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
              active
                ? 'border-sky-600 bg-sky-600 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700'
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
