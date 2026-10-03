// tone: สีไล่เฉดของการ์ด (pink | purple | blue | amber) — ขาวบนพื้นเข้มพอให้อ่านชัด
const TONES = {
  pink: 'from-[#e23d7e] to-[#f0629a]',
  purple: 'from-[#6d3fb5] to-[#9a6fd8]',
  blue: 'from-[#1f8fd0] to-[#4cc0ec]',
  amber: 'from-[#e8590c] to-[#f5a524]',
}

function KpiCard({ label, value, delta, tone = 'pink' }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-gradient-to-br p-4 text-white shadow-card sm:p-6 ${TONES[tone]}`}>
      <svg className="absolute -right-4 -bottom-6 size-32 text-white/10" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="50" fill="currentColor" />
      </svg>
      <p className="relative text-sm leading-[22px] font-medium text-white/90">{label}</p>
      <p className="relative mt-2 text-2xl leading-8 font-bold tabular-nums sm:text-[26px] sm:leading-10">{value}</p>
      {delta && (
        <p className="relative mt-2 inline-flex items-center gap-1 rounded-full bg-black/15 px-2 py-0.5 text-xs leading-[18px] font-medium tabular-nums">
          {delta.direction === 'up' ? '▲' : delta.direction === 'down' ? '▼' : '–'} {delta.text}
        </p>
      )}
    </div>
  )
}

export default KpiCard
