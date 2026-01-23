"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"

type Destination = {
  id: number | string
  name: string
  description?: string
  image_url?: string
  category?: string
  region?: string
}

export default function Home() {
  const { user } = useAuth()
  const [featured, setFeatured] = useState([] as Destination[])
  const [mounted, setMounted] = useState(false)

  // Track if component is mounted (client-side only)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only run on client side after mount
    if (!mounted) return

    const load = async () => {
      try {
        // 1) Determine liked IDs
        let likedIds: Array<string | number> = []

        if (user?.savedDestinations?.length) {
          likedIds = user.savedDestinations
        } else {
          // Only access localStorage on client side
          if (typeof window !== 'undefined') {
            const saved = JSON.parse(localStorage.getItem("likedDestinations") || "{}")
            likedIds = Object.values(saved || {}).map((d: any) => d.id)
          }
        }

        if (!likedIds.length) {
          setFeatured([])
          return
        }

        // 2) Fetch all destinations and filter by liked IDs
        const res = await fetch("/api/destinations")
        const data = await res.json()
        const all: Destination[] = data?.destinations || []

        const filtered = all.filter((d: Destination) => {
          const idStr = String(d.id)
          return likedIds.includes(d.id) || likedIds.includes(idStr)
        })

        setFeatured(filtered)
      } catch (err) {
        console.error("Error loading featured destinations:", err)
        setFeatured([])
      }
    }

    load()
  }, [user, mounted])

  return (
    <>
      <section className="relative h-[70vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light mb-4" translate="no">Travellatvia</h1>
          <p className="text-xl md:text-2xl font-light mb-8" suppressHydrationWarning translate="no">
            Choose your next adventure
          </p>
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

          {featured.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {featured.map((destination: Destination) => (
                <div key={destination.id} className="group border border-gray-200 rounded-md p-4 bg-white">
                  <div className="relative h-48 mb-3 overflow-hidden rounded-md bg-gray-200">
                    {destination.image_url && (
                      <img
                        src={destination.image_url}
                        alt={destination.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <h3 className="text-xl font-medium">{destination.name}</h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{destination.description}</p>
                  <div className="mt-3">
                    <Link href={`/destination/${destination.id}`} className="text-sm text-blue-600 hover:underline">
                    View details
                  </Link>
                  </div>
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
