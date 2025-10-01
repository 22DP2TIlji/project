<<<<<<< HEAD
'use client'

// components/header.tsx

import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"
=======
"use client"

>>>>>>> 99a512215bb441dd9eea9c98bcbfac1d5967566b
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import LoginModal from "./login-modal"
import SignupModal from "./signup-modal"
import { Menu, X, User } from "lucide-react"

export default function Header() {
  const { user, logout } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
<<<<<<< HEAD
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
=======
    <header className="w-full py-4 border-b bg-white sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-medium text-gray-800">
            Travellatvia
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-gray-900 hover:underline py-2">
                Home
>>>>>>> 99a512215bb441dd9eea9c98bcbfac1d5967566b
              </Link>
              <Link href="/popular-sights" className="text-gray-700 hover:text-gray-900 hover:underline py-2">
                Popular Sights
              </Link>
              <Link href="/itinerary" className="text-gray-700 hover:text-gray-900 hover:underline py-2">
                Itinerary Planner
              </Link>
              <Link href="/projects" className="text-gray-700 hover:text-gray-900 hover:underline py-2">
                Projects
              </Link>
              <Link href="/services" className="text-gray-700 hover:text-gray-900 hover:underline py-2">
                Services
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-gray-900 hover:underline py-2">
                About Us
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-gray-900 hover:underline py-2">
                Contact
              </Link>
            </nav>

            <div className="flex items-center space-x-4 pl-8 border-l border-gray-200">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <User size={18} />
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => setIsSignupModalOpen(true)}
                    className="px-4 py-2 text-sm bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/popular-sights"
                className="text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Popular Sights
              </Link>
              <Link
                href="/itinerary"
                className="text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Itinerary Planner
              </Link>
              <Link
                href="/projects"
                className="text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Projects
              </Link>
              <Link
                href="/services"
                className="text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>

            <div className="flex flex-col space-y-3 mt-6 pt-6 border-t border-gray-200">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <User size={18} />
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setIsLoginModalOpen(true)
                    }}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setIsSignupModalOpen(true)
                    }}
                    className="px-4 py-2 text-sm bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

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
