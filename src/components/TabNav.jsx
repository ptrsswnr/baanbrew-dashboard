export const TABS = [
  { id: 'overview', label: 'ภาพรวมยอดขาย', shortLabel: 'ภาพรวม' },
  { id: 'customers', label: 'ข้อมูลลูกค้า', shortLabel: 'ลูกค้า' },
  { id: 'lab2', label: 'Lab 2.2 · ซ่อมกราฟแย่', shortLabel: 'Lab' },
]

// แท็บบนสุด: ใช้บนจอ ≥768px (ที่แคบกว่านั้นใช้ BottomNav แทน ตาม design.md ส่วน 6)
function TabNav({ value, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="เลือกหน้า"
      className="hidden gap-1 overflow-x-auto rounded-md bg-bg-surface p-1.5 shadow-sm ring-1 ring-border md:flex"
    >
      {TABS.map((tab) => {
        const active = tab.id === value
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong ${
              active ? 'bg-brand-strong text-white' : 'text-ink-muted hover:bg-brand-tint'
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
