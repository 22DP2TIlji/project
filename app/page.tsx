"use client"
import React, { useEffect, useState } from 'react'
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

interface LikedDestination {
  id: string
  name: string
}

export default function Home() {
  const { user } = useAuth()
  const [likedDestinations, setLikedDestinations] = useState<Record<string, LikedDestination>>({})
  const [isClient, setIsClient] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    setIsClient(true)
    loadLikedDestinations()
    
    const handleStorageChange = () => {
      loadLikedDestinations()
    }
    
    // Check for dark mode preference
    if (typeof window !== 'undefined') {
      setDarkMode(document.documentElement.classList.contains('dark'))
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('likesUpdated', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('likesUpdated', handleStorageChange)
    }
  }, [user, refreshKey])

  const loadLikedDestinations = () => {
    if (!isClient) return

    try {
      if (user) {
        const users = JSON.parse(localStorage.getItem("users") || "[]")
        const currentUser = users.find((u: any) => u.id === user.id)

        if (currentUser && currentUser.likes) {
          setLikedDestinations(currentUser.likes)
          return
        }
      } else {
        const savedDestinations = JSON.parse(localStorage.getItem("likedDestinations") || "{}")
        setLikedDestinations(savedDestinations)
      }
    } catch (error) {
      console.error("Error loading liked destinations:", error)
      setLikedDestinations({})
    }
  }

  const refreshLikedDestinations = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200 dark:bg-gray-700">{/* Placeholder for background image */}</div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 dark:text-white">Choose your next adventure in Latvia</h1>
          <p className="mt-4 text-xl text-gray-700 dark:text-gray-200">Discover the best destinations and plan your trip</p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-light mb-4 text-gray-900 dark:text-white">We will help you to organize your adventure in Latvia</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Discover the best destinations, plan your itinerary, and create unforgettable memories in Latvia.
            </p>
            <Link
              href="/destinations"
              className="inline-block px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            >
              Explore Destinations
            </Link>
          </div>
        </div>
      </section>

      {/* Your Favorite Destinations */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light mb-4 text-center text-gray-900 dark:text-white">Your Favorite Destinations</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">Discover your saved places to visit</p>
          {Object.keys(likedDestinations).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.values(likedDestinations).map((destination) => (
                <div key={destination.id} className="relative group">
                  <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {/* Placeholder for destination image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-all duration-300"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-medium text-white mb-2">{destination.name}</h3>
                    <button
                      onClick={() => {
                        if (user) {
                          const users = JSON.parse(localStorage.getItem("users") || "[]")
                          const updatedUsers = users.map((u: any) => {
                            if (u.id === user.id) {
                              const { [destination.id]: removed, ...rest } = u.likes || {}
                              return { ...u, likes: rest }
                            }
                            return u
                          })
                          localStorage.setItem("users", JSON.stringify(updatedUsers))
                        } else {
                          const savedDestinations = JSON.parse(localStorage.getItem("likedDestinations") || "{}")
                          const { [destination.id]: removed, ...rest } = savedDestinations
                          localStorage.setItem("likedDestinations", JSON.stringify(rest))
                        }
                        window.dispatchEvent(new Event("likesUpdated"))
                        refreshLikedDestinations()
                      }}
                      className="text-sm text-white hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300">
                You haven't liked any destinations yet. Visit our{" "}
                <Link href="/destinations" className="text-gray-900 dark:text-white hover:underline">
                  Destinations
                </Link>{" "}
                page to discover amazing places in Latvia!
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
