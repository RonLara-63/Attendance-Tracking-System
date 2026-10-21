'use client'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useAsync } from '@/lib/useAsync'
import { correctAttendance, getAttendance, listSchedules } from '@/lib/api'
import { STATUS } from '@/lib/constants'
import { formatDate, formatTime, todayISO } from '@/lib/format'
import { Empty, ErrorBox, Field, Loading, PageHeader } from './ui'
import ClassSelect from './ClassSelect'
import StatusBadge from './StatusBadge'
import Modal from './Modal'
import ConfirmDialog from './ConfirmDialog'
import { useToast } from './Toast'

const CORRECTABLE = ['on_time', 'late', 'absent']

export default function AttendanceView({ role }) {
  const { user, profile } = useAuth()
  const toast = useToast()
  const params = useSearchParams()
  const isTeacher = role === 'teacher'

  const [scheduleId, setScheduleId] = useState(params.get('schedule') || '')
  const [date, setDate] = useState(todayISO())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const schedules = useAsync(() => listSchedules(isTeacher ? { teacherId: user.id } : {}), [isTeacher, user.id])
  useEffect(() => {
    if (!scheduleId && schedules.data?.length) setScheduleId(schedules.data[0].id)
  }, [schedules.data, scheduleId])

  const rows = useAsync(() => (scheduleId ? getAttendance(scheduleId, date) : Promise.resolve(null)), [scheduleId, date])

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (rows.data || []).filter(
      (r) => (!statusFilter || r.status === statusFilter) && (!q || r.full_name.toLowerCase().includes(q) || r.student_number.toLowerCase().includes(q))
    )
  }, [rows.data, search, statusFilter])

  const counts = useMemo(() => {
    const c = { on_time: 0, late: 0, absent: 0, pending: 0 }
    ;(rows.data || []).forEach((r) => { c[r.status] += 1 })
    return c
  }, [rows.data])

  // ---- Correction flow: form → confirmation → save ----
  const [target, setTarget] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [reason, setReason] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  function openCorrection(row) {
    setTarget(row)
    setNewStatus(CORRECTABLE.includes(row.status) ? row.status : '')
    setReason('')
  }
  const closeCorrection = () => { if (!busy) { setTarget(null); setConfirming(false) } }
  const canSubmit = newStatus && newStatus !== target?.status && reason.trim().length > 0

  async function submit() {
    setBusy(true)
    try {
      await correctAttendance({
        recordId: target.record_id, scheduleId, studentId: target.student_id, date,
        status: newStatus, reason: reason.trim(), oldStatus: target.status, actor: profile,
      })
      toast(`${target.full_name} is now marked ${STATUS[newStatus].label}.`)
      setTarget(null); setConfirming(false)
      rows.reload()
    } catch (e) {
      toast(e.message, 'error')
      setConfirming(false)
    }
    setBusy(false)
  }

  const noClasses = !schedules.loading && !schedules.error && schedules.data?.length === 0

  return (
    <>
      <PageHeader title="Attendance" subtitle={scheduleId && formatDate(date)} />

      {schedules.error && <ErrorBox message={schedules.error} onRetry={schedules.reload} />}
      {schedules.loading && !schedules.data && <Loading />}
      {noClasses && (
        <Empty title="No classes yet" hint={isTeacher ? 'You have no assigned classes. Ask an administrator to assign one to you.' : 'Create a class under Classes & Schedules first.'} />
      )}

      {schedules.data?.length > 0 && (
        <>
          <div className="card mb-4 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Class"><ClassSelect schedules={schedules.data} value={scheduleId} onChange={setScheduleId} /></Field>
            <Field label="Date"><input type="date" className="input" value={date} max="2100-01-01" onChange={(e) => e.target.value && setDate(e.target.value)} /></Field>
            <Field label="Student"><input className="input" placeholder="Name or student number" value={search} onChange={(e) => setSearch(e.target.value)} /></Field>
            <Field label="Status">
              <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All statuses</option>
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </Field>
          </div>

          <div className="mb-4 flex flex-wrap gap-3">
            {Object.entries(STATUS).map(([k, v]) => (
              <div key={k} className="card flex items-center gap-3 px-4 py-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: v.color }} />
                <span className="text-2xl font-bold">{counts[k]}</span>
                <span className="text-sm text-ink-soft">{v.label}</span>
              </div>
            ))}
          </div>

          {rows.error && <ErrorBox message={rows.error} onRetry={rows.reload} />}
          {rows.loading && !rows.data && <Loading label="Loading attendance…" />}
          {rows.data && rows.data.length === 0 && <Empty title="No students enrolled" hint="Enroll students in this class to see attendance here." />}
          {rows.data && rows.data.length > 0 && shown.length === 0 && <Empty title="No matches" hint="No students match these filters." />}
          {shown.length > 0 && (
            <div className={`table-wrap ${rows.loading ? 'opacity-60' : ''}`}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Student no.</th><th>Name</th>
                    <th className="hidden md:table-cell">Section</th>
                    <th>Status</th><th>Scanned</th><th><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((r) => (
                    <tr key={r.student_id}>
                      <td className="whitespace-nowrap">{r.student_number}</td>
                      <td className="font-bold">{r.full_name}</td>
                      <td className="hidden md:table-cell">{r.course_year_section}</td>
                      <td>
                        <StatusBadge status={r.status} corrected={r.was_corrected} />
                        {r.was_corrected && r.correction_reason && <p className="mt-1 max-w-xs text-sm text-ink-soft">Reason: {r.correction_reason}</p>}
                      </td>
                      <td className="whitespace-nowrap">{formatTime(r.scanned_at)}</td>
                      <td className="text-right"><button className="btn btn-quiet btn-sm" onClick={() => openCorrection(r)}>Correct</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <Modal
        open={!!target && !confirming}
        title={`Correct attendance: ${target?.full_name ?? ''}`}
        onClose={closeCorrection}
        footer={
          <>
            <button className="btn btn-quiet" onClick={closeCorrection}>Cancel</button>
            <button className="btn btn-primary" disabled={!canSubmit} onClick={() => setConfirming(true)}>Review change</button>
          </>
        }
      >
        <p className="mb-1 label">Current status</p>
        <div className="mb-4">{target && <StatusBadge status={target.status} corrected={target.was_corrected} />}</div>
        <fieldset className="mb-4">
          <legend className="label">New status</legend>
          <div className="flex flex-wrap gap-2">
            {CORRECTABLE.map((k) => (
              <label key={k} className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 ${newStatus === k ? 'border-accent bg-paper' : 'border-line'}`}>
                <input type="radio" name="status" value={k} checked={newStatus === k} onChange={() => setNewStatus(k)} />
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: STATUS[k].color }} />
                <span className="font-bold">{STATUS[k].label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="Reason (required)" hint="This is saved in the audit log with your name.">
          <textarea className="input" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
      </Modal>

      <ConfirmDialog
        open={confirming}
        title="Save this correction?"
        message={target && `Change ${target.full_name} from ${STATUS[target.status].label} to ${newStatus && STATUS[newStatus].label} for ${formatDate(date)}. This will appear in the audit log.`}
        confirmLabel="Save correction"
        busy={busy}
        onConfirm={submit}
        onCancel={() => setConfirming(false)}
      />
    </>
  )
}
