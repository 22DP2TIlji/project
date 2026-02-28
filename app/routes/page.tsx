"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { MapPin, Heart, MessageCircle, Copy } from "lucide-react"

type PublicRoute = {
  id: number
  name: string
  description: string | null
  userName: string
  likesCount: number
  commentsCount: number
  createdAt: string
}

export default function PublicRoutesPage() {
  const { user } = useAuth()
  const [routes, setRoutes] = useState<PublicRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [cloning, setCloning] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/routes/public?limit=20")
        const data = await res.json()
        if (data.success && data.routes) {
          setRoutes(data.routes)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const clone = async (routeId: number) => {
    if (!user || !user.id || user.id === "admin") {
      alert("Sign in to clone routes")
      return
    }
    setCloning(routeId)
    try {
      const res = await fetch(`/api/routes/${routeId}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })
      const data = await res.json()
      if (data.success) {
        alert("Route cloned! Check Plan Trip → Saved itineraries.")
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("savedItinerariesUpdated"))
        }
      } else {
        alert(data.message || "Failed to clone")
      }
    } catch (e) {
      console.error(e)
      alert("Failed to clone")
    } finally {
      setCloning(null)
    }
  }

  return (
    <>
      <section className="relative h-[35vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-light">Public routes</h1>
          <p className="mt-3 text-lg text-gray-600">
            Browse and clone routes shared by others
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {loading ? (
            <p className="text-gray-600 text-center">Loading…</p>
          ) : routes.length === 0 ? (
            <p className="text-gray-600 text-center">
              No public routes yet. Save your routes and make them public to share.
            </p>
          ) : (
            <ul className="space-y-4">
              {routes.map((r) => (
                <li
                  key={r.id}
                  className="bg-white p-4 rounded-md border border-gray-200"
                >
                  <h3 className="font-medium text-gray-900">{r.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">by {r.userName}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {r.likesCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {r.commentsCount}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => clone(r.id)}
                      disabled={cloning === r.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
                    >
                      <Copy className="h-4 w-4" />
                      {cloning === r.id ? "Cloning…" : "Clone"}
                    </button>
                    <Link
                      href={`/itinerary?route=${r.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:underline"
                    >
                      <MapPin className="h-4 w-4" />
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-8 text-center text-sm text-gray-500">
            <Link href="/itinerary" className="text-blue-600 hover:underline">
              Plan your own route
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}
