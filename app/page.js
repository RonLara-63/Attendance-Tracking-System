'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, homeFor } from '@/lib/auth'
import { Loading } from '@/components/ui'

export default function Home() {
  const { loading, profile } = useAuth()
  const router = useRouter()
  useEffect(() => { if (!loading) router.replace(homeFor(profile?.role)) }, [loading, profile, router])
  return <div className="grid min-h-screen place-items-center"><Loading /></div>
}
