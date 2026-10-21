'use client'
import AppShell from '@/components/AppShell'

export default function Layout({ children }) {
  return <AppShell role="super_admin">{children}</AppShell>
}
