const TABS = [
  { id: 'overview', label: 'ภาพรวมยอดขาย' },
  { id: 'customers', label: 'ข้อมูลลูกค้า' },
  { id: 'lab2', label: 'Lab 2.2 · ซ่อมกราฟแย่' },
]

function TabNav({ value, onChange }) {
  return (
    <div role="tablist" aria-label="เลือกหน้า" className="flex gap-1 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200">
      {TABS.map((tab) => {
        const active = tab.id === value
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
              active ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default TabNav
