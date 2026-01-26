"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function Header() {
  const { user, isAdmin } = useAuth()
  const pathname = usePathname()

  const links: Array<[string, string]> = [
    ["/destinations", "Destinations"],
    ["/itinerary", "Plan Trip"],
    ["/compare", "Compare"],
    ["/checklist", "Checklist"],
    ["/events", "Events"],
    ["/cuisine", "Cuisine"],
    ["/weather", "Weather"],
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
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user && (
              <Link
                href="/profile"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Account
              </Link>
            )}

            {user && isAdmin && isAdmin() && (
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

            {!user && (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}


