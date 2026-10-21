'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, homeFor } from '@/lib/auth'
import { DUMMY } from '@/lib/supabase'

export default function LoginPage() {
  const { loading, profile, signIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (!loading && profile) router.replace(homeFor(profile.role)) }, [loading, profile, router])

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true); setError('')
    const res = await signIn(email.trim(), password)
    if (res.error) { setError(res.error); setBusy(false) }
    else router.replace(homeFor(res.profile.role))
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-1 text-3xl font-bold">Attendance Dashboard</h1>
        <p className="mb-6 text-ink-soft">Sign in with your school account.</p>
        <form onSubmit={onSubmit} className="card p-6">
          <label className="mb-4 block">
            <span className="label">Email</span>
            <input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="mb-4 block">
            <span className="label">Password</span>
            <input className="input" type="password" autoComplete="current-password" required={!DUMMY} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p role="alert" className="mb-4 rounded-md border border-danger px-3 py-2 text-danger">{error}</p>}
          <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
        {DUMMY && (
          <p className="mt-4 rounded-md bg-white px-4 py-3 text-sm text-ink-soft">
            Dummy mode is on. Any email works. Include the word <b>admin</b> (for example admin@test.com) to sign in as the administrator; anything else signs in as a teacher.
          </p>
        )}
      </div>
    </main>
  )
}
