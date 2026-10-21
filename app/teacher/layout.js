'use client'
import AppShell from '@/components/AppShell'

export default function Layout({ children }) {
  return <AppShell role="teacher">{children}</AppShell>
}
