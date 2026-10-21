'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useAsync } from '@/lib/useAsync'
import { downloadCsv, listSchedules } from '@/lib/api'
import { addDays, todayISO } from '@/lib/format'
import { ErrorBox, Field, Loading, PageHeader } from './ui'
import ClassSelect from './ClassSelect'
import { useToast } from './Toast'

export default function ExportView({ role }) {
  const { user } = useAuth()
  const toast = useToast()
  const isTeacher = role === 'teacher'
  const [scheduleId, setScheduleId] = useState('')
  const [to, setTo] = useState(todayISO())
  const [from, setFrom] = useState(addDays(todayISO(), -6))
  const [busy, setBusy] = useState(false)

  const schedules = useAsync(() => listSchedules(isTeacher ? { teacherId: user.id } : {}), [isTeacher, user.id])
  const invalid = !from || !to || from > to

  async function onExport() {
    setBusy(true)
    try {
      await downloadCsv({ scheduleId, from, to, teacherId: isTeacher ? user.id : undefined })
      toast('CSV downloaded.')
    } catch (e) {
      toast(e.message, 'error')
    }
    setBusy(false)
  }

  return (
    <>
      <PageHeader title="Export attendance" subtitle="Download attendance records as a CSV file." />
      {schedules.error && <ErrorBox message={schedules.error} onRetry={schedules.reload} />}
      {schedules.loading && !schedules.data && <Loading />}
      {schedules.data && (
        <div className="card max-w-xl p-5">
          <Field label="Class">
            <ClassSelect schedules={schedules.data} value={scheduleId} onChange={setScheduleId} allLabel={isTeacher ? 'All my classes' : 'All classes'} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="From"><input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
            <Field label="To"><input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
          </div>
          {from && to && from > to && <p role="alert" className="mb-4 text-danger">The start date must be on or before the end date.</p>}
          <p className="mb-4 rounded-md border border-status-late bg-paper px-4 py-3 text-sm">
            This file contains personal data. Do not share or distribute.
          </p>
          <button className="btn btn-primary" disabled={busy || invalid} onClick={onExport}>{busy ? 'Preparing file…' : 'Download CSV'}</button>
        </div>
      )}
    </>
  )
}
