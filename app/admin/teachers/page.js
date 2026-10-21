'use client'
import { useState } from 'react'
import { useAsync } from '@/lib/useAsync'
import { createTeacher, listTeachers, setTeacherActive } from '@/lib/api'
import { Empty, ErrorBox, Field, InactiveTag, Loading, PageHeader } from '@/components/ui'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'

const blank = { full_name: '', email: '', password: '' }

export default function TeachersPage() {
  const toast = useToast()
  const { data, error, reload } = useAsync(listTeachers, [])
  const [form, setForm] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [busy, setBusy] = useState(false)

  async function onCreate(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await createTeacher(form)
      toast('Teacher account created.')
      setForm(null); reload()
    } catch (err) { toast(err.message, 'error') }
    setBusy(false)
  }
  async function onToggle() {
    setBusy(true)
    try {
      await setTeacherActive(confirm.id, !confirm.is_active)
      toast(confirm.is_active ? 'Teacher deactivated.' : 'Teacher reactivated.')
      setConfirm(null); reload()
    } catch (err) { toast(err.message, 'error') }
    setBusy(false)
  }

  return (
    <>
      <PageHeader title="Teachers" actions={<button className="btn btn-primary" onClick={() => setForm({ ...blank })}>Create teacher</button>} />
      {error && <ErrorBox message={error} onRetry={reload} />}
      {!data && !error && <Loading />}
      {data && data.length === 0 && <Empty title="No teachers yet" hint="Create an account so a teacher can sign in and see their classes." />}
      {data && data.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th className="hidden sm:table-cell">Email</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {data.map((t) => (
                <tr key={t.id} className={t.is_active === false ? 'text-ink-soft' : ''}>
                  <td className="font-bold">{t.full_name}{t.is_active === false && <InactiveTag />}</td>
                  <td className="hidden sm:table-cell">{t.email}</td>
                  <td className="text-right"><button className="btn btn-quiet btn-sm" onClick={() => setConfirm(t)}>{t.is_active === false ? 'Reactivate' : 'Deactivate'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!form}
        title="Create teacher account"
        onClose={() => !busy && setForm(null)}
        footer={
          <>
            <button type="button" className="btn btn-quiet" onClick={() => setForm(null)} disabled={busy}>Cancel</button>
            <button form="teacher-form" className="btn btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
          </>
        }
      >
        {form && (
          <form id="teacher-form" onSubmit={onCreate}>
            <Field label="Full name"><input className="input" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
            <Field label="Email"><input type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Temporary password" hint="At least 8 characters. The teacher can change it under Profile."><input type="password" className="input" minLength={8} required autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        danger={confirm?.is_active !== false}
        title={confirm?.is_active === false ? 'Reactivate teacher?' : 'Deactivate teacher?'}
        message={confirm && (confirm.is_active === false
          ? `${confirm.full_name} will be able to sign in again.`
          : `${confirm.full_name} will no longer be able to sign in. Their classes and attendance records are kept.`)}
        confirmLabel={confirm?.is_active === false ? 'Reactivate' : 'Deactivate'}
        busy={busy}
        onConfirm={onToggle}
        onCancel={() => setConfirm(null)}
      />
    </>
  )
}
