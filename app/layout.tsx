import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import AuthProvider from '@/lib/auth-context'
import { ThemeProvider } from '@/lib/theme-context'
import Header from "@/components/header"
import Footer from "@/components/footer"

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
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
