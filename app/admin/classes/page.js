'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useAsync } from '@/lib/useAsync'
import { listRooms, listSchedules, listTeachers, saveSchedule } from '@/lib/api'
import { DAYS } from '@/lib/constants'
import { dayName, hhmm, timeRange } from '@/lib/format'
import { Empty, ErrorBox, Field, Loading, PageHeader } from '@/components/ui'
import Modal from '@/components/Modal'
import { useToast } from '@/components/Toast'

const blank = { subject_code: '', subject_name: '', room_id: '', teacher_id: '', day_of_week: 0, start_time: '08:00', end_time: '10:00' }

export default function ClassesPage() {
  const toast = useToast()
  const { data, error, reload } = useAsync(async () => {
    const [schedules, rooms, teachers] = await Promise.all([listSchedules(), listRooms(), listTeachers()])
    return { schedules, rooms, teachers: teachers.filter((t) => t.is_active !== false) }
  }, [])
  const [form, setForm] = useState(null)
  const [busy, setBusy] = useState(false)

  async function onSave(e) {
    e.preventDefault()
    if (form.start_time >= form.end_time) return toast('The end time must be after the start time.', 'error')
    setBusy(true)
    try {
      await saveSchedule({ ...form, day_of_week: Number(form.day_of_week) })
      toast(form.id ? 'Class updated.' : 'Class created.')
      setForm(null); reload()
    } catch (err) { toast(err.message, 'error') }
    setBusy(false)
  }
  const edit = (c) => setForm({ ...c, start_time: hhmm(c.start_time), end_time: hhmm(c.end_time) })
  const canCreate = data && data.rooms.length > 0 && data.teachers.length > 0

  return (
    <>
      <PageHeader
        title="Classes & Schedules"
        actions={canCreate && <button className="btn btn-primary" onClick={() => setForm({ ...blank, room_id: data.rooms[0].id, teacher_id: data.teachers[0].id })}>Create class</button>}
      />
      {error && <ErrorBox message={error} onRetry={reload} />}
      {!data && !error && <Loading />}
      {data && !canCreate && <p className="mb-4 rounded-md border border-status-late bg-white px-4 py-3">Add at least one room and one active teacher before creating a class.</p>}
      {data && data.schedules.length === 0 && <Empty title="No classes yet" hint="Create a class with its subject, room, day, time and teacher." />}
      {data && data.schedules.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Subject</th><th>Day and time</th><th className="hidden md:table-cell">Room</th><th className="hidden md:table-cell">Teacher</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {data.schedules.map((c) => (
                <tr key={c.id}>
                  <td><b>{c.subject_code}</b><br />{c.subject_name}</td>
                  <td className="whitespace-nowrap">{dayName(c.day_of_week)}<br />{timeRange(c.start_time, c.end_time)}</td>
                  <td className="hidden md:table-cell">{c.room_name}</td>
                  <td className="hidden md:table-cell">{c.teacher_name}</td>
                  <td className="whitespace-nowrap text-right">
                    <button className="btn btn-quiet btn-sm mr-2" onClick={() => edit(c)}>Edit</button>
                    <Link className="btn btn-quiet btn-sm" href={`/admin/classes/${c.id}/enroll`}>Enroll students</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!form}
        wide
        title={form?.id ? 'Edit class' : 'Create class'}
        onClose={() => !busy && setForm(null)}
        footer={
          <>
            <button type="button" className="btn btn-quiet" onClick={() => setForm(null)} disabled={busy}>Cancel</button>
            <button form="class-form" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save class'}</button>
          </>
        }
      >
        {form && (
          <form id="class-form" onSubmit={onSave} className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Subject code"><input className="input" required value={form.subject_code} onChange={(e) => setForm({ ...form, subject_code: e.target.value })} /></Field>
            <Field label="Subject name"><input className="input" required value={form.subject_name} onChange={(e) => setForm({ ...form, subject_name: e.target.value })} /></Field>
            <Field label="Teacher">
              <select className="input" required value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}>
                {data.teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
            </Field>
            <Field label="Room">
              <select className="input" required value={form.room_id} onChange={(e) => setForm({ ...form, room_id: e.target.value })}>
                {data.rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </Field>
            <Field label="Day">
              <select className="input" value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}>
                {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Starts"><input type="time" className="input" required value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></Field>
              <Field label="Ends"><input type="time" className="input" required value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></Field>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
