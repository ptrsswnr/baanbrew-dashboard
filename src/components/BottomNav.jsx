import { TABS, TAB_ICONS } from './TabNav'

// แถบนำทางล่าง: ใช้บนจอ <768px แทน sidebar (TabNav) ตาม design.md ส่วน 6
function BottomNav({ value, onChange }) {
  return (
    <nav
      role="tablist"
      aria-label="เลือกหน้า"
      className="fixed inset-x-0 bottom-0 z-10 flex h-16 bg-side pb-[env(safe-area-inset-bottom)] md:hidden"
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
            className={`flex flex-1 flex-col items-center justify-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand ${
              active ? 'text-brand' : 'text-side-ink'
            }`}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {TAB_ICONS[tab.id]}
            </svg>
            <span className="text-xs leading-none font-medium">{tab.shortLabel}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav
