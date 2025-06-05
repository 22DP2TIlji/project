"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/lib/theme-context"
import { Menu, X, User, Sun, Moon, LogOut, ChevronDown } from "lucide-react"

export default function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
  }

  return (
    <header className="w-full py-4 px-6 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm transition-colors duration-300">
      <div className="container mx-auto flex flex-wrap justify-between items-center gap-4 px-0 md:px-4">
        <div className="flex items-center gap-8 w-full md:w-auto">
          <Link href="/" className="text-2xl font-medium text-gray-800 dark:text-gray-100 mr-6 whitespace-nowrap">
            Travellatvia
          </Link>
          <nav className="flex flex-wrap gap-4 md:gap-8 items-center">
            <Link 
              href="/" 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                pathname === '/' ? 'font-medium' : ''
              }`}
            >
              Home
            </Link>
            <Link 
              href="/destinations" 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                pathname === '/destinations' ? 'font-medium' : ''
              }`}
            >
              Destinations
            </Link>
            <Link 
              href="/itinerary" 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                pathname === '/itinerary' ? 'font-medium' : ''
              }`}
            >
              Itinerary
            </Link>
            <Link 
              href="/weather" 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                pathname === '/weather' ? 'font-medium' : ''
              }`}
            >
              Weather
            </Link>
            <Link 
              href="/events" 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                pathname === '/events' ? 'font-medium' : ''
              }`}
            >
              Events
            </Link>
            <Link 
              href="/transportation" 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                pathname === '/transportation' ? 'font-medium' : ''
              }`}
            >
              Transportation
            </Link>
            <Link
              href="/accommodations"
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                pathname === '/accommodations' ? 'font-medium' : ''
              }`}
            >
              Accommodations
            </Link>
            <Link 
              href="/cuisine" 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                pathname === '/cuisine' ? 'font-medium' : ''
              }`}
            >
              Cuisine
            </Link>
            <Link 
              href="/projects" 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                pathname === '/projects' ? 'font-medium' : ''
              }`}
            >
              Projects
            </Link>
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4 border-l border-gray-200 dark:border-gray-800 pl-4 mt-4 md:mt-0">
          {/* Dark mode toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
          </button>

          {/* Auth buttons */}
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors border border-blue-200 dark:border-blue-700 rounded px-3 py-1"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Login
              </Link>
              <Link href="/signup" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 py-4 border-t border-gray-200 dark:border-gray-800">
          <nav className="flex flex-col space-y-4">
            <Link 
              href="/" 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                pathname === '/' ? 'font-medium' : ''
              }`}
            >
              Home
            </Link>
            <Link 
              href="/destinations" 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                pathname === '/destinations' ? 'font-medium' : ''
              }`}
            >
              Destinations
            </Link>
            <Link 
              href="/itinerary" 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                pathname === '/itinerary' ? 'font-medium' : ''
              }`}
            >
              Itinerary
            </Link>
            <Link 
              href="/weather" 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                pathname === '/weather' ? 'font-medium' : ''
              }`}
            >
              Weather
            </Link>
            <Link 
              href="/events" 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                pathname === '/events' ? 'font-medium' : ''
              }`}
            >
              Events
            </Link>
            <Link 
              href="/transportation" 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                pathname === '/transportation' ? 'font-medium' : ''
              }`}
            >
              Transportation
            </Link>
            <Link
              href="/accommodations"
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                pathname === '/accommodations' ? 'font-medium' : ''
              }`}
            >
              Accommodations
            </Link>
            <Link 
              href="/cuisine" 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                pathname === '/cuisine' ? 'font-medium' : ''
              }`}
            >
              Cuisine
            </Link>
            <Link 
              href="/projects" 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                pathname === '/projects' ? 'font-medium' : ''
              }`}
            >
              Projects
            </Link>
          </nav>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            {user ? (
              <div className="flex flex-col space-y-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors border border-blue-200 dark:border-blue-700 rounded px-3 py-1"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <Link href="/login" className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && user && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md relative mt-40">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
              aria-label="Close"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-light mb-6 text-center text-gray-900 dark:text-white">Account Profile</h2>
            <div className="mb-4">
              <span className="block text-sm text-gray-500 dark:text-gray-400">Name:</span>
              <span className="text-lg font-medium text-gray-900 dark:text-white">{user.name}</span>
            </div>
            <div className="mb-4">
              <span className="block text-sm text-gray-500 dark:text-gray-400">Email:</span>
              <span className="text-lg font-medium text-gray-900 dark:text-white">{user.email}</span>
            </div>
            <div className="mb-4">
              <span className="block text-sm text-gray-500 dark:text-gray-400">Role:</span>
              <span className="text-lg font-medium text-gray-900 dark:text-white">{user.role}</span>
            </div>
            {user.created_at && (
              <div className="mb-4">
                <span className="block text-sm text-gray-500 dark:text-gray-400">Registered:</span>
                <span className="text-lg font-medium text-gray-900 dark:text-white">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            )}
            {user.preferences && (
              <div className="mb-4">
                <span className="block text-sm text-gray-500 dark:text-gray-400">Preferences:</span>
                <pre className="text-gray-900 dark:text-white text-xs bg-gray-100 dark:bg-gray-800 rounded p-2 overflow-x-auto">{JSON.stringify(user.preferences, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
