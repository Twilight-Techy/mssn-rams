import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ReactNode } from 'react'
import AuthProvider from '@/components/AuthProvider'

export const viewport: Viewport = {
  themeColor: '#0b512a',
}

export const metadata: Metadata = {
  title: 'MSSN RAMS',
  description: 'MSSN LASU Epe Attendance Management System',
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
