'use client'
import { useMemo, useState } from 'react'
import { useAsync } from '@/lib/useAsync'
import { listStudents, saveStudent, setStudentActive } from '@/lib/api'
import { Empty, ErrorBox, Field, InactiveTag, Loading, PageHeader } from '@/components/ui'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'

const blank = { student_number: '', full_name: '', course_year_section: '' }

export default function StudentsPage() {
  const toast = useToast()
  const { data, error, reload } = useAsync(listStudents, [])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [busy, setBusy] = useState(false)

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (data || []).filter((s) => !q || s.full_name.toLowerCase().includes(q) || s.student_number.toLowerCase().includes(q))
  }, [data, search])

  async function onSave(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await saveStudent(form)
      toast(form.id ? 'Student updated.' : 'Student added.')
      setForm(null); reload()
    } catch (err) { toast(err.message, 'error') }
    setBusy(false)
  }
  async function onToggle() {
    setBusy(true)
    try {
      await setStudentActive(confirm.id, !confirm.is_active)
      toast(confirm.is_active ? 'Student deactivated.' : 'Student reactivated.')
      setConfirm(null); reload()
    } catch (err) { toast(err.message, 'error') }
    setBusy(false)
  }

  return (
    <>
      <PageHeader title="Students" actions={<button className="btn btn-primary" onClick={() => setForm({ ...blank })}>Add student</button>} />
      <input className="input mb-4 max-w-md" placeholder="Search by name or student number" aria-label="Search students" value={search} onChange={(e) => setSearch(e.target.value)} />
      {error && <ErrorBox message={error} onRetry={reload} />}
      {!data && !error && <Loading />}
      {data && data.length === 0 && <Empty title="No students yet" hint="Add the first student to get started." />}
      {data && data.length > 0 && shown.length === 0 && <Empty title="No matches" hint="Try a different name or number." />}
      {shown.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Student no.</th><th>Name</th><th className="hidden sm:table-cell">Section</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {shown.map((s) => (
                <tr key={s.id} className={s.is_active === false ? 'text-ink-soft' : ''}>
                  <td className="whitespace-nowrap">{s.student_number}</td>
                  <td className="font-bold">{s.full_name}{s.is_active === false && <InactiveTag />}</td>
                  <td className="hidden sm:table-cell">{s.course_year_section}</td>
                  <td className="whitespace-nowrap text-right">
                    <button className="btn btn-quiet btn-sm mr-2" onClick={() => setForm({ ...s })}>Edit</button>
                    <button className="btn btn-quiet btn-sm" onClick={() => setConfirm(s)}>{s.is_active === false ? 'Reactivate' : 'Deactivate'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!form}
        title={form?.id ? 'Edit student' : 'Add student'}
        onClose={() => !busy && setForm(null)}
        footer={
          <>
            <button type="button" className="btn btn-quiet" onClick={() => setForm(null)} disabled={busy}>Cancel</button>
            <button form="student-form" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save student'}</button>
          </>
        }
      >
        {form && (
          <form id="student-form" onSubmit={onSave}>
            <Field label="Student number"><input className="input" required value={form.student_number} onChange={(e) => setForm({ ...form, student_number: e.target.value })} /></Field>
            <Field label="Full name"><input className="input" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
            <Field label="Course, year and section" hint="Example: BSIT 3-A"><input className="input" required value={form.course_year_section} onChange={(e) => setForm({ ...form, course_year_section: e.target.value })} /></Field>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        danger={confirm?.is_active !== false}
        title={confirm?.is_active === false ? 'Reactivate student?' : 'Deactivate student?'}
        message={confirm && (confirm.is_active === false
          ? `${confirm.full_name} will be able to scan at the kiosk again.`
          : `${confirm.full_name} will no longer be able to scan at the kiosk. Past attendance records are kept.`)}
        confirmLabel={confirm?.is_active === false ? 'Reactivate' : 'Deactivate'}
        busy={busy}
        onConfirm={onToggle}
        onCancel={() => setConfirm(null)}
      />
    </>
  )
}
