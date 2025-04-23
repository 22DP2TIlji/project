// app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const inter = Inter({ subsets: ['latin'] })

// ✅ Metadata is allowed now (since this stays a Server Component)
export const metadata: Metadata = {
  title: 'Travellatvia – Your Dream Adventure',
  description: 'Discover the beauty of Latvia with our travel guides and services',
}

// ✅ Dynamically load ClientNavbar so layout stays a Server Component
const ClientNavbar = dynamic(() => import('./components/ClientNavbar'), {
  ssr: false,
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <ClientNavbar />
        {children}
      </body>
    </html>
  )
}
