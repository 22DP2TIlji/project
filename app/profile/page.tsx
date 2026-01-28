'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MapPin, Route, Star, LogOut, TrendingUp, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import LikeButton from '@/components/like-button'

type SavedDestination = { id: number | string; name: string; description?: string; image_url?: string }

export default function ProfilePage() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [savedPlaces, setSavedPlaces] = useState<SavedDestination[]>([])
  const [savedItineraries, setSavedItineraries] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (user && user.id) {
      fetch(`/api/user-stats?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setStats(data.stats)
          }
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    }
  }, [user])

  useEffect(() => {
    if (!mounted || !user) return

    const loadSavedPlaces = async () => {
      const ids: (string | number)[] = user.savedDestinations?.length
        ? user.savedDestinations
        : []
      if (!ids.length) {
        setSavedPlaces([])
        return
      }
      try {
        const res = await fetch('/api/destinations')
        const data = await res.json()
        const all: SavedDestination[] = data?.destinations || []
        const filtered = all.filter((d) =>
          ids.some((id) => id === d.id || String(id) === String(d.id))
        )
        setSavedPlaces(filtered)
      } catch {
        setSavedPlaces([])
      }
    }

    loadSavedPlaces()
  }, [mounted, user, user?.savedDestinations])

  useEffect(() => {
    if (!mounted) return
    const load = async () => {
      // Если пользователь залогинен (не admin) — получаем его маршруты из БД
      if (user && user.id && user.id !== 'admin') {
        try {
          const res = await fetch(`/api/itineraries?userId=${user.id}`)
          const data = await res.json()

          if (data.success && Array.isArray(data.itineraries)) {
            setSavedItineraries(data.itineraries)
            return
          }
        } catch (e) {
          // если не удалось — просто упадём в гостевой режим ниже
        }
      }

      // Гостевой режим или фоллбек — читаем маршруты из localStorage
      try {
        const raw = localStorage.getItem('savedItineraries')
        setSavedItineraries(raw ? JSON.parse(raw) : [])
      } catch {
        setSavedItineraries([])
      }
    }
    load()
    window.addEventListener('savedItinerariesUpdated', load)
    return () => window.removeEventListener('savedItinerariesUpdated', load)
  }, [mounted, user])

  if (!user) return null

  return (
    <>
      <section className="relative h-[40vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light">My Profile</h1>
          <p className="mt-4 text-xl">Your travel statistics and account</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                <h2 className="text-2xl font-light mb-6 text-gray-800">Account Info</h2>
                <div className="mb-4">
                  <span className="block text-sm text-gray-500">Name:</span>
                  <span className="text-lg font-medium text-gray-900">{user.name}</span>
                </div>
                <div className="mb-4">
                  <span className="block text-sm text-gray-500">Email:</span>
                  <span className="text-lg font-medium text-gray-900">{user.email}</span>
                </div>
                <div className="mb-6">
                  <span className="block text-sm text-gray-500">Role:</span>
                  <span className="text-lg font-medium text-gray-900">
                    {isAdmin() ? 'Admin' : 'User'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="w-full rounded-md bg-red-600 py-3 px-4 text-white transition-colors hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 mb-6">
                <h2 className="text-2xl font-light mb-6 text-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  Your Statistics
                </h2>

                {loading ? (
                  <p className="text-gray-600">Loading statistics...</p>
                ) : stats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <span className="text-sm text-gray-600">Saved Places</span>
                      </div>
                      <p className="text-3xl font-light text-blue-600">{stats.savedDestinations}</p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-md border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Route className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-gray-600">Routes Created</span>
                      </div>
                      <p className="text-3xl font-light text-green-600">{stats.routesCreated}</p>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm text-gray-600">Reviews Written</span>
                      </div>
                      <p className="text-3xl font-light text-yellow-600">{stats.reviewsWritten}</p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-md border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-purple-600" />
                        <span className="text-sm text-gray-600">Avg Rating</span>
                      </div>
                      <p className="text-3xl font-light text-purple-600">
                        {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">No statistics available</p>
                )}
              </div>

              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 mb-6">
                <h3 className="text-xl font-light mb-4 text-gray-800 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Saved places
                </h3>
                {savedPlaces.length > 0 ? (
                  <div className="space-y-3">
                    {savedPlaces.slice(0, 5).map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                      >
                        <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden shrink-0">
                          {d.image_url && (
                            <img src={d.image_url} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{d.name}</p>
                          {d.description && (
                            <p className="text-sm text-gray-600 truncate">{d.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
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
                            View
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                    {savedPlaces.length > 5 && (
                      <Link
                        href="/saved"
                        className="block text-center text-blue-600 hover:underline text-sm py-2"
                      >
                        View all {savedPlaces.length} saved places
                      </Link>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600">No saved places yet. Like destinations to see them here.</p>
                    <Link href="/destinations" className="inline-block mt-2 text-blue-600 hover:underline text-sm">
                      Explore destinations
                    </Link>
                  </>
                )}
              </div>

              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 mb-6">
                <h3 className="text-xl font-light mb-4 text-gray-800 flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  Saved itineraries
                </h3>
                {savedItineraries.length > 0 ? (
                  <div className="space-y-3">
                    {savedItineraries.slice(0, 5).map((it: any) => (
                      <Link
                        key={it.id}
                        href="/itinerary"
                        className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                      >
                        <p className="font-medium text-gray-900">
                          {it.startPoint} → {it.endPoint}
                        </p>
                        <p className="text-sm text-gray-600">
                          {it.distance} km · {Math.floor(it.time || 0)} h {Math.round(((it.time || 0) % 1) * 60)} min
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {it.date ? new Date(it.date).toLocaleDateString() : ''}
                        </p>
                      </Link>
                    ))}
                    {savedItineraries.length > 5 && (
                      <Link
                        href="/itinerary"
                        className="block text-center text-blue-600 hover:underline text-sm py-2"
                      >
                        View all {savedItineraries.length} in Plan Trip
                      </Link>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600">No saved itineraries. Create routes on the Plan Trip page.</p>
                    <Link href="/itinerary" className="inline-block mt-2 text-blue-600 hover:underline text-sm">
                      Plan a trip
                    </Link>
                  </>
                )}
              </div>

              {stats && (
                <>
                  {stats.favoriteCategory && (
                    <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 mb-6">
                      <h3 className="text-xl font-light mb-4 text-gray-800">Favorite Category</h3>
                      <p className="text-2xl text-gray-900">{stats.favoriteCategory}</p>
                      {stats.categoryBreakdown && (
                        <div className="mt-4 space-y-2">
                          {Object.entries(stats.categoryBreakdown).map(([cat, count]: [string, any]) => (
                            <div key={cat} className="flex justify-between items-center">
                              <span className="text-gray-600">{cat}</span>
                              <span className="text-gray-900 font-medium">{count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {stats.favoriteRegion && (
                    <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 mb-6">
                      <h3 className="text-xl font-light mb-4 text-gray-800">Favorite Region</h3>
                      <p className="text-2xl text-gray-900">{stats.favoriteRegion}</p>
                      {stats.regionBreakdown && (
                        <div className="mt-4 space-y-2">
                          {Object.entries(stats.regionBreakdown).map(([reg, count]: [string, any]) => (
                            <div key={reg} className="flex justify-between items-center">
                              <span className="text-gray-600">{reg}</span>
                              <span className="text-gray-900 font-medium">{count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                    <h3 className="text-xl font-light mb-4 text-gray-800">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link
                        href="/saved"
                        className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="font-medium mb-1">View Saved Places</h4>
                        <p className="text-sm text-gray-600">See all your liked destinations</p>
                      </Link>
                      <Link
                        href="/itinerary"
                        className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="font-medium mb-1">Plan New Route</h4>
                        <p className="text-sm text-gray-600">Create a new itinerary</p>
                      </Link>
                      <Link
                        href="/compare"
                        className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="font-medium mb-1">Compare Destinations</h4>
                        <p className="text-sm text-gray-600">Compare up to 3 places</p>
                      </Link>
                      <Link
                        href="/destinations"
                        className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="font-medium mb-1">Explore More</h4>
                        <p className="text-sm text-gray-600">Discover new destinations</p>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
