"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import LikeButton from "@/components/like-button"
import { MapPin, Route, ChevronRight } from "lucide-react"

type Destination = {
  id: number | string
  name: string
  description?: string
  image_url?: string
  category?: string
  region?: string
}

export default function SavedPage() {
  const { user } = useAuth()
  const [savedPlaces, setSavedPlaces] = useState<Destination[]>([])
  const [savedItineraries, setSavedItineraries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const loadItineraries = () => {
      try {
        const raw = localStorage.getItem("savedItineraries")
        setSavedItineraries(raw ? JSON.parse(raw) : [])
      } catch {
        setSavedItineraries([])
      }
    }

    const load = async () => {
      let likedIds: (string | number)[] = []
      if (user?.savedDestinations?.length) {
        likedIds = user.savedDestinations
      } else if (typeof window !== "undefined") {
        const raw = localStorage.getItem("likedDestinations")
        if (raw) {
          const obj = JSON.parse(raw) as Record<string, { id: string | number }>
          likedIds = Object.values(obj).map((d) => d.id)
        }
      }

      if (likedIds.length > 0) {
        try {
          const res = await fetch("/api/destinations")
          const data = await res.json()
          const all: Destination[] = data?.destinations || []
          const filtered = all.filter((d) =>
            likedIds.some((id) => id === d.id || String(id) === String(d.id))
          )
          setSavedPlaces(filtered)
        } catch {
          setSavedPlaces([])
        }
      } else {
        setSavedPlaces([])
      }

      loadItineraries()
      setLoading(false)
    }

    load()
    window.addEventListener("savedItinerariesUpdated", loadItineraries)
    window.addEventListener("likedDestinationsUpdated", load)
    return () => {
      window.removeEventListener("savedItinerariesUpdated", loadItineraries)
      window.removeEventListener("likedDestinationsUpdated", load)
    }
  }, [mounted, user, user?.savedDestinations])

  return (
    <>
      <section className="relative h-[40vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200" />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light">Saglabātie</h1>
          <p className="mt-4 text-xl">Jūsu iecienītās galamērķis un maršruti</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="space-y-8">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-gray-100 rounded-md animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-light mb-2 flex items-center gap-2">
                  <MapPin className="h-6 w-6" />
                  Saglabātie galamērķi
                </h2>
                <p className="text-gray-600 mb-6">
                  Vietas, kas jums patika. Tās parādās arī sākumlapā un jūsu profilā.
                </p>
                {savedPlaces.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedPlaces.map((d) => (
                      <div
                        key={d.id}
                        className="group flex rounded-xl overflow-hidden border border-gray-200 bg-white hover:shadow-lg transition-shadow"
                      >
                        <div className="w-28 shrink-0 h-28 bg-gray-200 overflow-hidden">
                          {d.image_url && (
                            <img
                              src={d.image_url}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-center min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{d.name}</h3>
                          {d.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">{d.description}</p>
                          )}
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <LikeButton
                              destinationId={String(d.id)}
                              destinationName={d.name}
                              onLikeChange={() => {
                                setSavedPlaces((prev) => prev.filter((x) => String(x.id) !== String(d.id)))
                              }}
                            />
                            <Link
                              href={`/destination/${d.id}`}
                              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                            >
                              View details
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center rounded-xl border-2 border-dashed border-gray-200">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Vēl nav saglabātu galamērķu.</p>
                    <Link href="/destinations" className="inline-block mt-4 text-blue-600 hover:underline font-medium">
                      Izpēti galamērķus
                    </Link>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-light mb-2 flex items-center gap-2">
                  <Route className="h-6 w-6" />
                  Saglabātie maršruti
                </h2>
                <p className="text-gray-600 mb-6">
                  Maršruti, kurus esat saglabājis lapā “Plānojiet ceļojumu”. Pārvaldiet tos tur.
                </p>
                {savedItineraries.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedItineraries.map((it: any) => (
                      <Link
                        key={it.id}
                        href="/itinerary"
                        className="block p-6 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-blue-200 transition-all"
                      >
                        <p className="font-medium text-gray-900">
                          {it.startPoint} → {it.endPoint}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {it.distance} km · {Math.floor(it.time || 0)} h{" "}
                          {Math.round(((it.time || 0) % 1) * 60)} min
                        </p>
                        {it.date && (
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(it.date).toLocaleDateString()}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-1 mt-3 text-blue-600 text-sm font-medium">
                          Atvērt plānā Ceļojums
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center rounded-xl border-2 border-dashed border-gray-200">
                    <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Vēl nav saglabātu maršrutu.</p>
                    <Link href="/itinerary" className="inline-block mt-4 text-blue-600 hover:underline font-medium">
                      Plānojiet ceļojumu
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
