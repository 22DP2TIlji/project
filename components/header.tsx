"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/lib/theme-context"
import LoginModal from "./login-modal"
import SignupModal from "./signup-modal"
import { Menu, X, User, Sun, Moon, LogOut, ChevronDown } from "lucide-react"

export default function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
  }

  return (
    <header className="w-full py-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-medium text-gray-800 dark:text-gray-100">
            Travellatvia
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-8">
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

            <div className="flex items-center space-x-4 pl-8 border-l border-gray-200 dark:border-gray-800">
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
                    onClick={handleLogout}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setIsSignupModalOpen(true)}
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
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
                    onClick={handleLogout}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-4">
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setIsSignupModalOpen(true)}
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onSignupClick={() => {
          setIsLoginModalOpen(false)
          setIsSignupModalOpen(true)
        }}
      />
      <SignupModal 
        isOpen={isSignupModalOpen} 
        onClose={() => setIsSignupModalOpen(false)}
        onLoginClick={() => {
          setIsSignupModalOpen(false)
          setIsLoginModalOpen(true)
        }}
      />
    </header>
  )
}
