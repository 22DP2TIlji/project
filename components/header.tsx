"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useState, useRef, useEffect } from "react"

const primaryLinks: Array<[string, string]> = [
  ["/destinations", "Destinations"],
  ["/trip-planner", "Trip Planner"],
  ["/routes", "Public Routes"],
]

const planLinks: Array<[string, string]> = [
  ["/itinerary", "Plan Trip"],
  ["/quiz", "Where to go?"],
  ["/compare", "Compare"],
  ["/checklist", "Checklist"],
]

const exploreLinks: Array<[string, string]> = [
  ["/events", "Events"],
  ["/cuisine", "Cuisine"],
  ["/weather", "Weather"],
]

function Dropdown({ label, links, pathname }: { label: string; links: Array<[string, string]>; pathname: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [open])

  const isActive = links.some(([href]) => pathname === href)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
          isActive
            ? "text-blue-700 dark:text-blue-300 bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-400/30"
            : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        <span suppressHydrationWarning>{label}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 py-1 min-w-[160px] rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {links.map(([href, linkLabel]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2 text-sm ${
                pathname === href
                  ? "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {linkLabel}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function NavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = pathname === href
  return (
    <Link
      href={href}
      className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
        active
          ? "text-blue-700 dark:text-blue-300 bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-400/30"
          : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <span suppressHydrationWarning>{label}</span>
    </Link>
  )
}

export default function Header() {
  const { user, isAdmin } = useAuth()
  const pathname = usePathname() ?? ""

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-900/60 border-b border-gray-200/70 dark:border-gray-800 notranslate" translate="no">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">TravelLatvia</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {primaryLinks.map(([href, label]) => (
              <NavLink key={href} href={href} label={label} pathname={pathname} />
            ))}
            <Dropdown label="Plan & tools" links={planLinks} pathname={pathname} />
            <Dropdown label="Explore" links={exploreLinks} pathname={pathname} />
            <NavLink href="/contact" label="Contact" pathname={pathname} />
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


