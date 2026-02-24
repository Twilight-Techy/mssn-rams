import type { Metadata } from 'next'
import './globals.css'
import { ReactNode } from 'react'
import AuthProvider from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'MSSN RAMS',
  description: 'MSSN LASU Epe Attendance Management System',
  themeColor: '#0b512a',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
