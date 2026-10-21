'use client'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useAsync } from '@/lib/useAsync'
import { listSchedules } from '@/lib/api'
import { dayName, timeRange, todayWeekday } from '@/lib/format'
import { Empty, ErrorBox, Loading, PageHeader } from '@/components/ui'

export default function MyClassesPage() {
  const { user } = useAuth()
  const { data, error, reload } = useAsync(() => listSchedules({ teacherId: user.id }), [user.id])
  const today = todayWeekday()
  return (
    <>
      <PageHeader title="My classes" />
      {error && <ErrorBox message={error} onRetry={reload} />}
      {!data && !error && <Loading />}
      {data && data.length === 0 && <Empty title="No classes assigned" hint="Ask an administrator to assign a class to your account." />}
      {data && data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((c) => (
            <div key={c.id} className={`card p-5 ${c.day_of_week === today ? 'border-accent border-2' : ''}`}>
              <p className="text-sm font-bold text-ink-soft">{c.day_of_week === today ? 'Today' : dayName(c.day_of_week)}</p>
              <h2 className="text-xl font-bold">{c.subject_code}</h2>
              <p>{c.subject_name}</p>
              <p className="mt-3">{timeRange(c.start_time, c.end_time)}</p>
              <p className="text-ink-soft">{c.room_name}</p>
              <Link className="btn btn-primary btn-sm mt-4" href={`/teacher/attendance?schedule=${c.id}`}>View attendance</Link>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
