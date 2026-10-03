export const TABS = [
  { id: 'overview', label: 'ภาพรวมยอดขาย', shortLabel: 'ภาพรวม', title: 'ภาพรวมยอดขาย', subtitle: 'ยอดขาย จำนวนบิล และสาขาที่ขายดี' },
  { id: 'customers', label: 'ข้อมูลลูกค้า', shortLabel: 'ลูกค้า', title: 'ข้อมูลลูกค้า', subtitle: 'สมาชิก กลุ่มอายุ และลูกค้าประจำ' },
  { id: 'lab2', label: 'Lab 2.2 · ซ่อมกราฟแย่', shortLabel: 'Lab', title: 'Lab 2.2 · ซ่อมกราฟแย่', subtitle: 'เทียบกราฟที่แย่กับกราฟที่แก้แล้ว' },
]

export const TAB_ICONS = {
  overview: <path d="M4 20V10M10 20V4M16 20V13M22 20V8" />,
  customers: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M21 20c0-2.6-1.8-4.8-4-5.6" />
    </>
  ),
  lab2: <path d="M9 3h6M10 3v5.5L5.5 17a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 8.5V3" />,
}

// แถบข้าง (sidebar) สีเข้ม: ใช้บนจอ ≥768px (ที่แคบกว่านั้นใช้ BottomNav แทน ตาม design.md ส่วน 6)
function TabNav({ value, onChange }) {
  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-60 shrink-0 flex-col rounded-lg bg-side p-5 text-side-ink shadow-card md:flex">
      <div className="flex items-center gap-2.5 px-2">
        <span className="flex size-9 items-center justify-center rounded-full bg-brand text-lg" aria-hidden="true">☕</span>
        <span className="text-xl font-bold text-white">Baanbrew</span>
      </div>

      <div className="mt-8 flex flex-col items-center border-b border-white/10 pb-6">
        <span className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-brand to-series-bangna text-2xl font-bold text-white ring-4 ring-white/10">
          บ
        </span>
        <p className="mt-3 text-base font-semibold text-white">บ้านบรู</p>
        <p className="text-xs">Coffee &amp; Bakery Analytics</p>
      </div>

      <div role="tablist" aria-label="เลือกหน้า" aria-orientation="vertical" className="mt-6 flex flex-col gap-1">
        {TABS.map((tab) => {
          const active = tab.id === value
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={`relative flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                active ? 'bg-white/5 text-brand' : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              {active && <span className="absolute inset-y-1.5 -left-5 w-1.5 rounded-r-full bg-brand" aria-hidden="true" />}
              <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {TAB_ICONS[tab.id]}
              </svg>
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="mt-auto rounded-md bg-white/5 p-4 text-xs leading-5">
        <p className="font-semibold text-white">ข้อมูลตัวอย่าง</p>
        <p>กรองตามสาขาและช่วงวันที่ได้จากแถบด้านบน ลิงก์ของหน้านี้แชร์ได้</p>
      </div>
    </aside>
  )
}

export default TabNav
