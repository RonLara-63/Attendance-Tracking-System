import { Atkinson_Hyperlegible } from 'next/font/google'
import Providers from '@/components/Providers'
import './globals.css'

const body = Atkinson_Hyperlegible({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-body' })

export const metadata = { title: 'Attendance Dashboard', description: 'Teacher and admin dashboard for the barcode attendance system' }
export const viewport = { width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={body.variable}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
