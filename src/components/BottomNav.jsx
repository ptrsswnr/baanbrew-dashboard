import { TABS } from './TabNav'

const ICONS = {
  overview: (
    <path d="M4 20V10M10 20V4M16 20V13M22 20V8" />
  ),
  customers: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M21 20c0-2.6-1.8-4.8-4-5.6" />
    </>
  ),
  lab2: (
    <path d="M9 3h6M10 3v5.5L5.5 17a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 8.5V3" />
  ),
}

// แถบนำทางล่าง: ใช้บนจอ <768px แทนแท็บบน (TabNav) ตาม design.md ส่วน 6
function BottomNav({ value, onChange }) {
  return (
    <nav
      role="tablist"
      aria-label="เลือกหน้า"
      className="fixed inset-x-0 bottom-0 z-10 flex h-16 border-t border-border bg-bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
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
            className="flex flex-1 flex-col items-center justify-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-strong"
          >
            <span className={`flex size-8 items-center justify-center rounded-full ${active ? 'bg-brand-tint' : ''}`}>
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke={active ? 'var(--color-brand-strong)' : 'var(--color-ink-muted)'} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {ICONS[tab.id]}
              </svg>
            </span>
            <span className={`text-xs leading-none font-medium ${active ? 'text-brand-strong' : 'text-ink-muted'}`}>
              {tab.shortLabel}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav
