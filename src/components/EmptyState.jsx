function EmptyState({ message }) {
  return (
    <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
      <p className="text-slate-500">{message}</p>
    </div>
  )
}

export default EmptyState
