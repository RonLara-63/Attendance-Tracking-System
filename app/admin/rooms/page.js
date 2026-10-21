'use client'
import { useState } from 'react'
import { useAsync } from '@/lib/useAsync'
import { listRooms, saveRoom } from '@/lib/api'
import { Empty, ErrorBox, Field, Loading, PageHeader } from '@/components/ui'
import Modal from '@/components/Modal'
import { useToast } from '@/components/Toast'

export default function RoomsPage() {
  const toast = useToast()
  const { data, error, reload } = useAsync(listRooms, [])
  const [form, setForm] = useState(null)
  const [busy, setBusy] = useState(false)

  async function onSave(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await saveRoom(form)
      toast(form.id ? 'Room updated.' : 'Room added.')
      setForm(null); reload()
    } catch (err) { toast(err.message, 'error') }
    setBusy(false)
  }

  return (
    <>
      <PageHeader title="Rooms" actions={<button className="btn btn-primary" onClick={() => setForm({ name: '', location: '' })}>Add room</button>} />
      {error && <ErrorBox message={error} onRetry={reload} />}
      {!data && !error && <Loading />}
      {data && data.length === 0 && <Empty title="No rooms yet" hint="Add a room, then use it when you create a class." />}
      {data && data.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Room</th><th>Location</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id}>
                  <td className="font-bold">{r.name}</td>
                  <td>{r.location}</td>
                  <td className="text-right"><button className="btn btn-quiet btn-sm" onClick={() => setForm({ ...r })}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal
        open={!!form}
        title={form?.id ? 'Edit room' : 'Add room'}
        onClose={() => !busy && setForm(null)}
        footer={
          <>
            <button type="button" className="btn btn-quiet" onClick={() => setForm(null)} disabled={busy}>Cancel</button>
            <button form="room-form" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save room'}</button>
          </>
        }
      >
        {form && (
          <form id="room-form" onSubmit={onSave}>
            <Field label="Room name"><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Location" hint="Building or floor"><input className="input" value={form.location ?? ''} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
          </form>
        )}
      </Modal>
    </>
  )
}
