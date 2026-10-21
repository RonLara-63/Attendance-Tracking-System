'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth, homeFor } from '@/lib/auth'
import { Loading } from './ui'
import { MenuIcon } from './icons'

const NAV = {
  super_admin: [
    ['Dashboard', '/admin/dashboard'],
    ['Students', '/admin/students'],
    ['Teachers', '/admin/teachers'],
    ['Rooms', '/admin/rooms'],
    ['Classes & Schedules', '/admin/classes'],
    ['Attendance', '/admin/attendance'],
    ['Export', '/admin/export'],
    ['Audit Log', '/admin/audit-log'],
    ['Profile', '/admin/profile'],
  ],
  teacher: [
    ['My Classes', '/teacher/classes'],
    ['Attendance', '/teacher/attendance'],
    ['Export', '/teacher/export'],
    ['Profile', '/teacher/profile'],
  ],
}

export default function AppShell({ role, children }) {
  const { loading, user, profile, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) router.replace('/login')
    else if (profile?.role !== role) router.replace(homeFor(profile?.role))
  }, [loading, user, profile, role, router])

  useEffect(() => setOpen(false), [pathname])

  if (loading || !user || profile?.role !== role) {
    return <div className="grid min-h-screen place-items-center"><Loading label="Checking your session…" /></div>
  }

  const links = NAV[role]
  return (
    <div className="min-h-screen md:flex">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-sidebar px-4 py-3 text-white md:hidden">
        <span className="text-lg font-bold">Attendance</span>
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded p-2 hover:bg-white/10"><MenuIcon /></button>
      </header>
      {open && <div className="fixed inset-0 z-30 bg-ink/50 md:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-sidebar text-white transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="px-5 py-6">
          <p className="text-xl font-bold">Attendance</p>
          <p className="text-sm text-white/70">{role === 'super_admin' ? 'Administrator' : 'Teacher'}</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3" aria-label="Main">
          {links.map(([label, href]) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`mb-1 block rounded-md px-3 py-3 font-bold ${active ? 'bg-white text-ink' : 'text-white/85 hover:bg-white/10'}`}
              >
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-white/15 px-5 py-4">
          <p className="truncate font-bold">{profile.full_name || user.email}</p>
          <button onClick={async () => { await signOut(); router.replace('/login') }} className="mt-2 text-sm text-white/80 underline hover:text-white">
            Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  )
}
