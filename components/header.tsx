"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function Header() {
  const { user } = useAuth()
  const pathname = usePathname()

  const links: Array<[string, string]> = [
    ["/destinations", "Destinations"],
    ["/accommodations", "Accommodations"],
    ["/itinerary", "Plan Trip"],
    ["/events", "Events"],
    ["/transportation", "Transportation"],
    ["/weather", "Weather"],
    ["/cuisine", "Cuisine"],
    ["/services", "Services"],
    ["/projects", "Projects"],
    ["/about", "About"],
    ["/contact", "Contact"],
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-900/60 border-b border-gray-200/70 dark:border-gray-800 notranslate" translate="no">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">TravelLatvia</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center flex-wrap gap-x-2 gap-y-2">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  pathname === href
                    ? "text-blue-700 dark:text-blue-300 bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-400/30"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span suppressHydrationWarning>{label}</span>
              </Link>
            ))}

            {user && (
              <Link
                href="/saved"
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  pathname === "/saved"
                    ? "text-blue-700 dark:text-blue-300 bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-400/30"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span suppressHydrationWarning>Saved</span>
              </Link>
            )}
            {user && (user as any).role === "admin" && (
              <Link
                href="/admin"
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  pathname === "/admin"
                    ? "text-blue-700 dark:text-blue-300 bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-400/30"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span suppressHydrationWarning>Admin</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}


