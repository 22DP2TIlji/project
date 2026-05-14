import type React from "react"
// @ts-ignore: CSS module declarations may be missing in the current TS config
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/lib/theme-context"
import Header from "@/components/header"
import footer from "@/components/footer"

export const metadata = {
  title: "TravelLatvia | Ceļo gudri",
  description: "Plāno savu perfekto ceļojumu pa Latviju",
}

export const dynamic = "force-dynamic"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="lv" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            <Header />
            <main className="min-h-screen pt-16">
              {children}
            </main>
            <footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}