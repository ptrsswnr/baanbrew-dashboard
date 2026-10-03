function KpiCard({ label, value, delta }) {
  return (
    <div className="rounded-lg bg-bg-surface p-4 shadow-sm ring-1 ring-border sm:p-6">
      <p className="text-sm leading-[22px] font-medium text-ink-muted">{label}</p>
      <p className="mt-2 text-2xl leading-8 font-bold tabular-nums text-ink sm:text-[28px] sm:leading-10">
        {value}
      </p>
      {delta && (
        <p
          className={`mt-1 text-xs leading-[18px] font-medium tabular-nums ${
            delta.direction === 'up' ? 'text-positive' : delta.direction === 'down' ? 'text-negative' : 'text-ink-muted'
          }`}
        >
          {delta.direction === 'up' ? '▲' : delta.direction === 'down' ? '▼' : '–'} {delta.text}
        </p>
      )}
    </div>
  )
}

export default KpiCard
