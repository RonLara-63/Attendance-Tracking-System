import { STATUS } from '@/lib/constants'
import { PencilIcon } from './icons'

export default function StatusBadge({ status, corrected }) {
  const s = STATUS[status] || STATUS.pending
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-bold text-ink" style={{ backgroundColor: s.color }}>
        {s.label}
      </span>
      {corrected && (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft" title="Manually corrected">
          <PencilIcon /> Corrected
        </span>
      )}
    </span>
  )
}
