import type React from "react"
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";



import "./globals.css"
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/lib/theme-context'
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Weather App",
  description: "Get accurate weather forecasts for any location",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning translate="no">
      <body className={inter.className} suppressHydrationWarning translate="no">
        <AuthProvider>
          <ThemeProvider>
            <Header />
            <main className="pt-16">{children}</main>
            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
