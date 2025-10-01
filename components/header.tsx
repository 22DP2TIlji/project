'use client'

// components/header.tsx

import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"
import Link from "next/link"

// Simple SVG icons to replace lucide-react
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>
  </svg>
)

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const LogOutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

export default function Header() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-900/60 border-b border-gray-200/70 dark:border-gray-800 notranslate" translate="no">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                TravelLatvia
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center flex-wrap gap-x-2 gap-y-2">
            <Link 
              href="/destinations" 
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/destinations' 
                  ? 'text-blue-700 dark:text-blue-300 bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-400/30' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span suppressHydrationWarning>Destinations</span>
            </Link>
            <Link 
              href="/accommodations" 
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/accommodations' 
                  ? 'text-blue-700 dark:text-blue-300 bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-400/30' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span suppressHydrationWarning>Accommodations</span>
            </Link>
            <Link 
              href="/itinerary" 
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/itinerary' 
                  ? 'text-blue-700 dark:text-blue-300 bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-400/30' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span suppressHydrationWarning>Plan Trip</span>
            </Link>
            <Link 
              href="/events" 
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/events' 
                  ? 'text-blue-700 dark:text-blue-300 bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-400/30' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span suppressHydrationWarning>Events</span>
            </Link>
            <Link 
              href="/transportation" 
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/transportation' 
                  ? 'text-blue-700 dark:text-blue-300 bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-400/30' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span suppressHydrationWarning>Transportation</span>
            </Link>
            <Link 
              href="/weather" 
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/weather' 
                  ? 'text-blue-700 dark:text-blue-300 bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-400/30' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span suppressHydrationWarning>Weather</span>
            </Link>
            <Link 
              href="/cuisine" 
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/cuisine' 
                  ? 'text-blue-700 dark:text-blue-300 bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-400/30' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span suppressHydrationWarning>Cuisine</span>
            </Link>
            <Link 
              href="/services" 
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/services' 
                  ? 'text-blue-700 dark:text-blue-300 bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-400/30' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span suppressHydrationWarning>Services</span>
            </Link>
            <Link 
              href="/projects" 
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/projects' 
                  ? 'text-blue-700 dark:text-blue-300 bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-400/30' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span suppressHydrationWarning>Projects</span>
            </Link>
            <Link 
              href="/about" 
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/about' 
                  ? 'text-blue-700 dark:text-blue-300 bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-400/30' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span suppressHydrationWarning>About</span>
            </Link>
            <Link 
              href="/contact" 
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/contact' 
                  ? 'text-blue-700 dark:text-blue-300 bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-400/30' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span suppressHydrationWarning>Contact</span>
            </Link>
            {user && (
              <Link 
                href="/saved" 
                className={`text-sm font-medium transition-colors ${
                  pathname === '/saved' 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <span suppressHydrationWarning>Saved</span>
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link 
                href="/admin" 
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  pathname === '/admin' 
                    ? 'text-blue-700 dark:text-blue-300 bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-400/30' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span suppressHydrationWarning>Admin</span>
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* User menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <UserIcon />
                  <span>{user.name}</span>
                  <ChevronDownIcon />
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/saved"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Saved Items
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-700"></div>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <LogOutIcon />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <MenuIcon />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}