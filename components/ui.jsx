export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-ink-soft">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-3 py-10 text-ink-soft" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-accent" />
      {label}
    </div>
  )
}

export function Empty({ title, hint, action }) {
  return (
    <div className="card px-6 py-12 text-center">
      <p className="text-lg font-bold">{title}</p>
      {hint && <p className="mx-auto mt-1 max-w-md text-ink-soft">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="card border-danger px-5 py-4" role="alert">
      <p className="font-bold text-danger">Could not load this page</p>
      <p className="mt-1 text-ink-soft">{message}</p>
      {onRetry && <button className="btn btn-quiet btn-sm mt-3" onClick={onRetry}>Try again</button>}
    </div>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="mb-4 block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-sm text-ink-soft">{hint}</span>}
    </label>
  )
}

export function StatCard({ label, value, note }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-bold text-ink-soft">{label}</p>
      <p className="mt-1 text-4xl font-bold">{value}</p>
      {note && <p className="mt-1 text-sm text-ink-soft">{note}</p>}
    </div>
  )
}

export function InactiveTag() {
  return <span className="ml-2 rounded-full bg-paper px-2 py-0.5 text-xs font-bold text-ink-soft">Inactive</span>
}
