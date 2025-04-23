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
      <section className="relative h-[70vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200">{/* Placeholder for background image */}</div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light mb-4">Travellatvia</h1>
          <p className="text-xl md:text-2xl font-light mb-8">Choose your next adventure</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="border border-gray-200 p-8 md:p-12 rounded-md text-center">
            <h2 className="text-3xl font-light mb-4">We will help you to organize your adventure in Latvia</h2>
            <Link
              href="/popular-sights"
              className="inline-block mt-6 px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Explore Popular Sights
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light mb-4 text-center">Featured Destinations</h2>

          {isClient && Object.keys(likedDestinations).length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {Object.values(likedDestinations).map((destination) => (
                <div key={destination.id} className="group">
                  <div className="relative h-64 mb-4 overflow-hidden rounded-md bg-gray-200">
                    {/* Placeholder for image */}
                  </div>
                  <h3 className="text-xl font-medium">{destination.name}</h3>
                  <Link href={`/destination/${destination.id}`} className="text-sm text-gray-600 hover:underline">
                    View details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                You haven't liked any destinations yet. Visit our{" "}
                <Link href="/popular-sights" className="text-gray-800 underline">
                  Popular Sights
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
