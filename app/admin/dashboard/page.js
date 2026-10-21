'use client'
import { useEffect } from 'react'
import { useAsync } from '@/lib/useAsync'
import { getDashboard } from '@/lib/api'
import { isOnline, timeAgo, timeRange } from '@/lib/format'
import { Empty, ErrorBox, Loading, PageHeader, StatCard } from '@/components/ui'

export default function DashboardPage() {
  const { data, loading, error, reload } = useAsync(getDashboard, [])

  // Refresh so kiosk status stays current
  useEffect(() => {
    const id = setInterval(reload, 30000)
    return () => clearInterval(id)
  })

  if (error) return <ErrorBox message={error} onRetry={reload} />
  if (!data) return <Loading />

  const online = data.kiosks.filter((k) => isOnline(k.last_seen_at)).length
  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Active students" value={data.studentCount} />
        <StatCard label="Classes today" value={data.todayClasses.length} />
        <StatCard label="Kiosks online" value={`${online} of ${data.kiosks.length}`} note="Online means seen in the last 2 minutes" />
      </div>

      <h2 className="mb-3 text-xl font-bold">Kiosks</h2>
      {data.kiosks.length === 0 ? (
        <Empty title="No kiosks registered" hint="Kiosks appear here after they are set up on a Raspberry Pi." />
      ) : (
        <ul className="card mb-8 divide-y divide-line">
          {data.kiosks.map((k) => {
            const on = isOnline(k.last_seen_at)
            return (
              <li key={k.device_name} className="flex items-center gap-3 px-5 py-4">
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: on ? '#66bb6a' : '#9aa0a6' }} aria-hidden="true" />
                <span className="font-bold">{k.device_name}</span>
                {k.is_active === false && <span className="text-sm text-ink-soft">(disabled)</span>}
                <span className="ml-auto text-ink-soft">{on ? 'Online' : `Offline, last seen ${timeAgo(k.last_seen_at)}`}</span>
              </li>
            )
          })}
        </ul>
      )}

      <h2 className="mb-3 text-xl font-bold">Today&apos;s classes</h2>
      {data.todayClasses.length === 0 ? (
        <Empty title="No classes scheduled today" />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Subject</th><th>Time</th><th>Room</th><th>Teacher</th></tr></thead>
            <tbody>
              {data.todayClasses.map((c) => (
                <tr key={c.id}>
                  <td><b>{c.subject_code}</b> {c.subject_name}</td>
                  <td className="whitespace-nowrap">{timeRange(c.start_time, c.end_time)}</td>
                  <td>{c.room_name}</td>
                  <td>{c.teacher_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
