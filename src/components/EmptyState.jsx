function EmptyState({ message, actionLabel, onAction }) {
  return (
    <div className="rounded-lg bg-bg-surface p-10 text-center shadow-sm ring-1 ring-border">
      <p className="text-ink-muted">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-md bg-brand-strong px-4 py-2 text-sm font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
