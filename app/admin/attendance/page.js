'use client'
import { Suspense } from 'react'
import AttendanceView from '@/components/AttendanceView'
import { Loading } from '@/components/ui'

export default function Page() {
  return <Suspense fallback={<Loading />}><AttendanceView role="super_admin" /></Suspense>
}
