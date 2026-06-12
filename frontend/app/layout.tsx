import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'JobPilot — AI求职助手',
  description: 'AI-powered job search and resume analytics',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className={`${geist.variable} h-full`}>
      <body className="h-full bg-[#0f1117] text-white antialiased">
        <div className="flex h-full">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  )
}
