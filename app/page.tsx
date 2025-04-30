"use client"
import React, { useReducer } from 'react'
import Link from "next/link"
import { useEffect, useState } from "react"
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

  useEffect(() => {
    setIsClient(true)
    loadLikedDestinations()
    
    const handleStorageChange = () => {
      loadLikedDestinations()
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
      <section className="relative h-[70vh] bg-gray-100 dark:bg-gray-950 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-gray-900/40 dark:from-gray-950 dark:to-gray-900/80"></div>
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 dark:opacity-5"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-light mb-4 text-white dark:text-gray-100 drop-shadow-lg">Travellatvia</h1>
          <p className="text-xl md:text-2xl font-light mb-8 text-gray-100 dark:text-gray-300 drop-shadow-lg">Choose your next adventure</p>
        </div>
      </section>

      <section className="py-16 dark:bg-gray-900/50 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 to-transparent dark:from-gray-900/50 dark:to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="border border-gray-200 dark:border-gray-700/50 p-8 md:p-12 rounded-md text-center dark:bg-gray-800/30 backdrop-blur-sm shadow-lg">
            <h2 className="text-3xl font-light mb-4 dark:text-gray-100">We will help you to organize your adventure in Latvia</h2>
            <Link
              href="/destinations"
              className="inline-block mt-6 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 dark:text-gray-200 bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm"
            >
              Explore Destinations
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light mb-4 text-center text-gray-900 dark:text-gray-100">Featured Destinations</h2>

          {isClient && Object.keys(likedDestinations).length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {Object.values(likedDestinations).map((destination) => (
                <div key={destination.id} className="group border border-gray-200 dark:border-gray-700/50 rounded-md p-6 hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800/30 backdrop-blur-sm">
                  <div className="relative h-64 mb-4 overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700/50">
                    {/* Placeholder for image */}
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">{destination.name}</h3>
                  <Link href={`/destination/${destination.id}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:underline transition-colors duration-300">
                    View details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                You haven't liked any destinations yet. Visit our{" "}
                <Link href="/destinations" className="text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white underline transition-colors duration-300">
                  Destinations
                </Link>{" "}
                page to discover and like destinations.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
