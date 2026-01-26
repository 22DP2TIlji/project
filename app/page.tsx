"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import LikeButton from "@/components/like-button"
import {
  Search,
  MapPin,
  Heart,
  Cloud,
  Route,
  Compass,
  ChevronRight,
  Sparkles,
} from "lucide-react"

type Destination = {
  id: number | string
  name: string
  description?: string
  image_url?: string
  category?: string
  region?: string
}

const CATEGORIES = [
  { slug: "city", label: "City" },
  { slug: "nature", label: "Nature" },
  { slug: "beach", label: "Beach" },
  { slug: "palace", label: "Palace" },
]

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [popular, setPopular] = useState<Destination[]>([])
  const [saved, setSaved] = useState<Destination[]>([])
  const [destinationsCount, setDestinationsCount] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [loadingPopular, setLoadingPopular] = useState(true)
  const [loadingSaved, setLoadingSaved] = useState(false)
  const [savedItineraries, setSavedItineraries] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const loadPopular = async () => {
      setLoadingPopular(true)
      try {
        const res = await fetch("/api/destinations?limit=6")
        const data = await res.json()
        setPopular(data?.destinations || [])
      } catch {
        setPopular([])
      } finally {
        setLoadingPopular(false)
      }
    }

    const loadCount = async () => {
      try {
        const res = await fetch("/api/destinations?countOnly=true")
        const data = await res.json()
        if (data?.count != null) setDestinationsCount(data.count)
      } catch {
        setDestinationsCount(null)
      }
    }

    loadPopular()
    loadCount()
  }, [mounted])

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

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return
    const load = () => {
      try {
        const raw = localStorage.getItem("savedItineraries")
        setSavedItineraries(raw ? JSON.parse(raw) : [])
      } catch {
        setSavedItineraries([])
      }
    }
    load()
    window.addEventListener("savedItinerariesUpdated", load)
    return () => window.removeEventListener("savedItinerariesUpdated", load)
  }, [mounted])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) router.push(`/destinations?search=${encodeURIComponent(q)}`)
    else router.push("/destinations")
  }

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/images/hero-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <p className="animate-fade-in-up text-amber-300/90 text-sm md:text-base tracking-[0.3em] uppercase mb-4 font-medium">
            Discover Latvia
          </p>
          <h1 className="animate-fade-in-up text-5xl md:text-7xl lg:text-8xl font-light text-white mb-4 tracking-tight" style={{ animationDelay: "0.1s" }}>
            TravelLatvia
          </h1>
          <p className="animate-fade-in-up text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto" style={{ animationDelay: "0.2s" }}>
            Choose your next adventure. Plan routes, save favorites, and explore.
          </p>

          <form onSubmit={handleSearch} className="animate-fade-in-up max-w-xl mx-auto mb-8" style={{ animationDelay: "0.3s" }}>
            <div className="flex flex-col sm:flex-row gap-2 rounded-xl overflow-hidden shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur p-1">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search destinations..."
                  className="w-full pl-12 pr-4 py-3 bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-gray-900 font-medium rounded-lg transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          <div className="animate-fade-in-up flex flex-wrap justify-center gap-3" style={{ animationDelay: "0.4s" }}>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              Explore destinations
              <ChevronRight className="h-5 w-5" />
            </Link>
            <Link
              href="/itinerary"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
            >
              <Route className="h-5 w-5" />
              Plan your trip
            </Link>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-float">
          <ChevronRight className="h-8 w-8 text-white/60 rotate-90" />
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 md:py-16 bg-muted/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in-up">
              <p className="text-3xl md:text-4xl font-light text-amber-600 dark:text-amber-500">
                {destinationsCount != null ? `${destinationsCount}+` : "—"}
              </p>
              <p className="text-muted-foreground mt-1">Destinations</p>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <p className="text-3xl md:text-4xl font-light text-amber-600 dark:text-amber-500">Plan</p>
              <p className="text-muted-foreground mt-1">Your route on the map</p>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <p className="text-3xl md:text-4xl font-light text-amber-600 dark:text-amber-500">Save</p>
              <p className="text-muted-foreground mt-1">Favorites & itineraries</p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore by category */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-4">
            Explore by category
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-10">
            Cities, nature, beaches, palaces — find what fits your mood.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/destinations?category=${c.slug}`}
                className="px-5 py-2.5 rounded-full border-2 border-border hover:border-amber-500 hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-400 transition-all font-medium"
              >
                {c.label}
              </Link>
            ))}
            <Link
              href="/destinations"
              className="px-5 py-2.5 rounded-full bg-amber-500 text-gray-900 hover:bg-amber-600 font-medium transition-colors"
            >
              View all
            </Link>
          </div>
        </div>
      </section>

      {/* Popular destinations */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-500 text-sm font-medium mb-2">
                <Sparkles className="h-4 w-4" />
                Popular
              </span>
              <h2 className="text-3xl md:text-4xl font-light">
                Popular destinations
              </h2>
            </div>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-500 hover:underline font-medium"
            >
              See all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {loadingPopular ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl bg-muted h-72 animate-pulse" />
              ))}
            </div>
          ) : popular.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popular.map((d) => (
                <Link
                  key={d.id}
                  href={`/destination/${d.id}`}
                  className="group block rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl hover:border-amber-500/30 transition-all duration-300"
                >
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <img
                      src={d.image_url || "/placeholder.jpg"}
                      alt={d.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div
                      className="absolute top-3 right-3 z-10"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      <LikeButton
                        destinationId={String(d.id)}
                        destinationName={d.name}
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="font-semibold text-lg">{d.name}</h3>
                      {d.category && (
                        <span className="text-white/80 text-sm">{d.category}</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {d.description}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-2 text-amber-600 dark:text-amber-500 text-sm font-medium group-hover:gap-2 transition-all">
                      View details
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl border border-dashed border-border">
              <Compass className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No destinations yet. Add some in the admin panel.
              </p>
              <Link href="/destinations" className="mt-4 inline-block text-amber-600 dark:text-amber-500 font-medium hover:underline">
                Explore destinations
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Plan your trip CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Link
            href="/itinerary"
            className="group block max-w-4xl mx-auto rounded-3xl overflow-hidden border-2 border-border bg-gradient-to-br from-amber-500/10 to-amber-600/5 hover:border-amber-500/50 transition-all duration-300"
          >
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-500 text-sm font-medium mb-3">
                  <Route className="h-4 w-4" />
                  Itinerary
                </span>
                <h2 className="text-2xl md:text-3xl font-light mb-2">
                  Plan your route across Latvia
                </h2>
                <p className="text-muted-foreground mb-6">
                  Pick start and end points, see distance and time, and save your itinerary.
                </p>
                <span className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-500 font-medium group-hover:gap-3 transition-all">
                  Open route planner
                  <ChevronRight className="h-5 w-5" />
                </span>
              </div>
              <div className="relative h-48 md:h-auto min-h-[200px] bg-muted">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-90"
                  style={{ backgroundImage: "url(/images/home-bg.jpg)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/80 md:bg-gradient-to-l md:from-background/60 md:via-transparent md:to-transparent" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Why TravelLatvia */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-4">
            Why TravelLatvia?
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-14">
            Your one place to discover, plan, and remember trips across Latvia.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Compass,
                title: "Discover",
                text: "Browse destinations by category and region. Find cities, nature, beaches, and more.",
              },
              {
                icon: Heart,
                title: "Save favorites",
                text: "Like places you want to visit. Your saved list is always available.",
              },
              {
                icon: Route,
                title: "Plan routes",
                text: "Build itineraries on the map. See distances and estimated travel time.",
              },
              {
                icon: Cloud,
                title: "Weather & more",
                text: "Check weather, events, and practical info to prepare your trip.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl border border-border bg-card hover:border-amber-500/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your saved destinations */}
      <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-light mb-4">
              Your saved destinations
            </h2>
            <p className="text-muted-foreground mb-10">
              Places you liked. Quick access to plan your next visit.
            </p>

            {loadingSaved ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl bg-muted h-56 animate-pulse" />
                ))}
              </div>
            ) : saved.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {saved.map((d) => (
                    <div
                      key={d.id}
                      className="group flex rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl hover:border-amber-500/30 transition-all duration-300"
                    >
                      <Link href={`/destination/${d.id}`} className="flex flex-1 min-w-0">
                        <div className="w-32 shrink-0 h-32 md:h-36 bg-muted overflow-hidden">
                          <img
                            src={d.image_url || "/placeholder.jpg"}
                            alt={d.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-center min-w-0">
                          <h3 className="font-semibold truncate">{d.name}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2 mt-0.5">
                            {d.description}
                          </p>
                          <span className="inline-flex items-center gap-1 mt-2 text-amber-600 dark:text-amber-500 text-sm font-medium">
                            View
                            <ChevronRight className="h-4 w-4" />
                          </span>
                        </div>
                      </Link>
                      <div
                        className="p-2 flex items-center shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
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
                <div className="mt-8 text-center">
                  <Link
                    href="/saved"
                    className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-500 font-medium hover:underline"
                  >
                    View all saved
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-16 rounded-2xl border border-dashed border-border">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t liked any destinations yet.
                </p>
                <Link
                  href="/destinations"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 text-gray-900 hover:bg-amber-600 font-medium transition-colors"
                >
                  Explore destinations
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

      {/* Saved itineraries */}
      {savedItineraries.length > 0 && (
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-light mb-4">
              Your saved routes
            </h2>
            <p className="text-muted-foreground mb-10">
              Recent itineraries you saved. Open Plan Trip to manage them.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedItineraries.slice(0, 3).map((it: any) => (
                <Link
                  key={it.id}
                  href="/itinerary"
                  className="block p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Route className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                    <span className="font-medium">{it.startPoint} → {it.endPoint}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {it.distance} km · {Math.floor(it.time || 0)} h {Math.round(((it.time || 0) % 1) * 60)} min
                  </p>
                  {it.date && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(it.date).toLocaleDateString()}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 mt-3 text-amber-600 dark:text-amber-500 text-sm font-medium">
                    Open in Plan Trip
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/itinerary"
                className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-500 font-medium hover:underline"
              >
                View all in Plan Trip
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-light mb-4">
            Ready to explore?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Discover destinations, plan your route, and save your favorites — all in one place.
          </p>
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-gray-900 font-medium rounded-xl transition-colors shadow-lg"
          >
            Start exploring
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  )
}
