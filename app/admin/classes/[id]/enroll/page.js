'use client'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useAsync } from '@/lib/useAsync'
import { enrollStudents, listEnrolled, listSchedules, listStudents, unenrollStudent } from '@/lib/api'
import { dayName, timeRange } from '@/lib/format'
import { Empty, ErrorBox, Loading, PageHeader } from '@/components/ui'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'

export default function EnrollPage({ params }) {
  const { id } = params
  const toast = useToast()
  const { data, error, reload } = useAsync(async () => {
    const [schedules, enrolled, students] = await Promise.all([listSchedules(), listEnrolled(id), listStudents()])
    return { cls: schedules.find((c) => c.id === id), enrolled, students }
  }, [id])
  const [picked, setPicked] = useState([])
  const [search, setSearch] = useState('')
  const [remove, setRemove] = useState(null)
  const [busy, setBusy] = useState(false)

  const available = useMemo(() => {
    if (!data) return []
    const taken = new Set(data.enrolled.map((e) => e.student_id))
    const q = search.trim().toLowerCase()
    return data.students.filter(
      (s) => s.is_active !== false && !taken.has(s.id) && (!q || s.full_name.toLowerCase().includes(q) || s.student_number.toLowerCase().includes(q))
    )
  }, [data, search])

  const toggle = (sid) => setPicked((p) => (p.includes(sid) ? p.filter((x) => x !== sid) : [...p, sid]))

  async function onEnroll() {
    setBusy(true)
    try {
      await enrollStudents(id, picked)
      toast(`${picked.length} student${picked.length === 1 ? '' : 's'} enrolled.`)
      setPicked([]); reload()
    } catch (err) { toast(err.message, 'error') }
    setBusy(false)
  }
  async function onRemove() {
    setBusy(true)
    try {
      await unenrollStudent(id, remove.student_id)
      toast('Student removed from this class.')
      setRemove(null); reload()
    } catch (err) { toast(err.message, 'error') }
    setBusy(false)
  }

  if (error) return <ErrorBox message={error} onRetry={reload} />
  if (!data) return <Loading />
  if (!data.cls) return <Empty title="Class not found" action={<Link className="btn btn-quiet" href="/admin/classes">Back to classes</Link>} />

  const { cls } = data
  const enrolledSorted = [...data.enrolled].sort((a, b) => (a.students?.full_name || '').localeCompare(b.students?.full_name || ''))
  return (
    <>
      <Link href="/admin/classes" className="mb-2 inline-block text-accent underline">Back to classes</Link>
      <PageHeader title={`Enroll students: ${cls.subject_code}`} subtitle={`${cls.subject_name}, ${dayName(cls.day_of_week)} ${timeRange(cls.start_time, cls.end_time)}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-xl font-bold">Enrolled ({enrolledSorted.length})</h2>
          {enrolledSorted.length === 0 ? (
            <Empty title="No students enrolled" hint="Pick students from the list and enroll them." />
          ) : (
            <ul className="card divide-y divide-line">
              {enrolledSorted.map((e) => (
                <li key={e.student_id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{e.students?.full_name}</p>
                    <p className="text-sm text-ink-soft">{e.students?.student_number}</p>
                  </div>
                  <button className="btn btn-quiet btn-sm ml-auto" onClick={() => setRemove(e)}>Remove</button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">Add students</h2>
          <input className="input mb-3" placeholder="Search by name or student number" aria-label="Search students" value={search} onChange={(e) => setSearch(e.target.value)} />
          {available.length === 0 ? (
            <Empty title="No students to add" hint="Everyone active is already enrolled, or nothing matches your search." />
          ) : (
            <ul className="card max-h-[28rem] divide-y divide-line overflow-y-auto">
              {available.map((s) => (
                <li key={s.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-paper">
                    <input type="checkbox" className="h-5 w-5" checked={picked.includes(s.id)} onChange={() => toggle(s.id)} />
                    <span className="min-w-0">
                      <span className="block truncate font-bold">{s.full_name}</span>
                      <span className="text-sm text-ink-soft">{s.student_number}, {s.course_year_section}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          <button className="btn btn-primary mt-3" disabled={busy || picked.length === 0} onClick={onEnroll}>
            {picked.length ? `Enroll ${picked.length} selected` : 'Enroll selected'}
          </button>
        </section>
      </div>

      <ConfirmDialog
        open={!!remove}
        danger
        title="Remove student from class?"
        message={remove && `${remove.students?.full_name} will no longer appear in this class's attendance list. Existing attendance records are kept.`}
        confirmLabel="Remove"
        busy={busy}
        onConfirm={onRemove}
        onCancel={() => setRemove(null)}
      />
    </>
  )
}
