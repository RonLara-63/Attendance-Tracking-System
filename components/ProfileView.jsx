'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { changePassword } from '@/lib/api'
import { Field, PageHeader } from './ui'
import { useToast } from './Toast'

export default function ProfileView() {
  const { user, profile } = useAuth()
  const toast = useToast()
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (pw.length < 8) return setError('Use at least 8 characters.')
    if (pw !== pw2) return setError('The two passwords do not match.')
    setBusy(true)
    try {
      await changePassword(pw)
      toast('Password changed.')
      setPw(''); setPw2('')
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  return (
    <>
      <PageHeader title="Profile" />
      <div className="card mb-6 max-w-xl p-5">
        <p className="text-sm font-bold text-ink-soft">Name</p>
        <p className="mb-3 text-lg">{profile.full_name || '—'}</p>
        <p className="text-sm font-bold text-ink-soft">Email</p>
        <p className="text-lg">{user.email}</p>
      </div>
      <form onSubmit={onSubmit} className="card max-w-xl p-5">
        <h2 className="mb-4 text-xl font-bold">Change password</h2>
        <Field label="New password"><input type="password" autoComplete="new-password" className="input" value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
        <Field label="Confirm new password"><input type="password" autoComplete="new-password" className="input" value={pw2} onChange={(e) => setPw2(e.target.value)} /></Field>
        {error && <p role="alert" className="mb-4 text-danger">{error}</p>}
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Change password'}</button>
      </form>
    </>
  )
}
