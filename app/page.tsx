"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import LikeButton from "@/components/like-button"
import RandomPlace from "@/components/random-place"

const home = {
  title: "Discover Latvia",
  subtitle: "Plan your perfect trip through Latvia",
  helpOrganize: "We help you organize your journey",
  exploreDestinations: "Explore destinations",
}

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
  const [saved, setSaved] = useState<Destination[]>([])
  const [mounted, setMounted] = useState(false)
  const [loadingSaved, setLoadingSaved] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const loadSaved = async () => {
      let likedIds: Array<string | number> = []
      if (user?.savedDestinations?.length) {
        likedIds = user.savedDestinations
      } else if (typeof window !== "undefined") {
        const raw = localStorage.getItem("likedDestinations")
        if (raw) {
          const obj = JSON.parse(raw) as Record<string, { id: string | number }>
          likedIds = Object.values(obj).map((d) => d.id)
        }
      }
      if (!likedIds.length) {
        setSaved([])
        setLoadingSaved(false)
        return
      }

      setLoadingSaved(true)
      try {
        const res = await fetch("/api/destinations")
        const data = await res.json()
        const all: Destination[] = data?.destinations || []
        const filtered = all.filter((d) => {
          const idStr = String(d.id)
          return likedIds.includes(d.id) || likedIds.includes(idStr)
        })
        setSaved(filtered)
      } catch {
        setSaved([])
      } finally {
        setLoadingSaved(false)
      }
    }

    loadSaved()
    window.addEventListener("likedDestinationsUpdated", loadSaved)
    return () => window.removeEventListener("likedDestinationsUpdated", loadSaved)
  }, [user, mounted])

  return (
    <>
      <section className="relative h-[70vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200" />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light mb-4" translate="no">
            {home.title}
          </h1>
          <p className="text-xl md:text-2xl font-light mb-8" suppressHydrationWarning translate="no">
            {home.subtitle}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <div className="border border-gray-200 p-8 md:p-12 rounded-md text-center">
                <h2 className="text-3xl font-light mb-4">
                  {home.helpOrganize}
                </h2>
                <Link
                  href="/destinations"
                  className="inline-block mt-6 px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {home.exploreDestinations}
                </Link>
              </div>
            </div>
            <div>
              <RandomPlace />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light mb-4 text-center">Featured Destinations</h2>

          {loadingSaved ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : saved.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {saved.map((d) => (
                <div
                  key={d.id}
                  className="group border border-gray-200 rounded-md p-4 bg-white"
                >
                  <div className="relative h-48 mb-3 overflow-hidden rounded-md bg-gray-200">
                    {d.image_url && (
                      <img
                        src={d.image_url}
                        alt={d.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <h3 className="text-xl font-medium">{d.name}</h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{d.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Link
                      href={`/destination/${d.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View details
                    </Link>
                    <LikeButton
                      destinationId={String(d.id)}
                      destinationName={d.name}
                      onLikeChange={() => {
                        setSaved((prev) => prev.filter((x) => String(x.id) !== String(d.id)))
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                You haven&apos;t liked any destinations yet. Visit our{" "}
                <Link href="/destinations" className="text-gray-800 underline">
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
