export default function KpiCard({ label, value, note }) {
  return (
    <div className="rounded-lg bg-bg-surface p-5 shadow-card">
      <div className="text-sm text-ink-muted">{label}</div>
      <div className="mt-1 text-2xl sm:text-3xl font-semibold tabular-nums text-ink">{value}</div>
      {note && <div className="mt-1 text-xs text-ink-muted/60">{note}</div>}
    </div>
  );
}
