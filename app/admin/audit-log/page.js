'use client'
import { useAsync } from '@/lib/useAsync'
import { listAudit } from '@/lib/api'
import { formatDate, formatDateTime } from '@/lib/format'
import { Empty, ErrorBox, Loading, PageHeader } from '@/components/ui'
import StatusBadge from '@/components/StatusBadge'

export default function AuditLogPage() {
  const { data, error, reload } = useAsync(listAudit, [])
  return (
    <>
      <PageHeader title="Audit log" subtitle="Every manual attendance correction, newest first." />
      {error && <ErrorBox message={error} onRetry={reload} />}
      {!data && !error && <Loading />}
      {data && data.length === 0 && <Empty title="No corrections yet" hint="Corrections made by teachers will be listed here." />}
      {data && data.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>When</th><th>Corrected by</th><th>Student</th><th>Class and date</th><th>Change</th><th>Reason</th></tr></thead>
            <tbody>
              {data.map((a) => (
                <tr key={a.id}>
                  <td className="whitespace-nowrap">{formatDateTime(a.created_at)}</td>
                  <td>{a.corrected_by_name ?? '—'}</td>
                  <td className="font-bold">{a.student_name ?? '—'}</td>
                  <td className="whitespace-nowrap">{a.subject_code}<br />{a.session_date && formatDate(a.session_date)}</td>
                  <td>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={a.old_status} /><span aria-label="changed to">to</span><StatusBadge status={a.new_status} />
                    </div>
                  </td>
                  <td className="min-w-[14rem]">{a.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
