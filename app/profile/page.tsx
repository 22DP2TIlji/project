'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { MapPin, Route, Star, LogOut, TrendingUp, ChevronRight, DollarSign, Trash2 } from 'lucide-react'
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
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const loadStatsAndSavedPlaces = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const statsRes = await fetch(`/api/user-stats?userId=${user.id}`)
      const statsData = await statsRes.json()
      if (statsData.success) setStats(statsData.stats)

      if (user.id !== 'admin') {
        const likedRes = await fetch(
          `/api/users/liked-destinations?userId=${encodeURIComponent(user.id)}`
        )
        const likedData = await likedRes.json()
        if (likedData.success && Array.isArray(likedData.likedDestinations)) {
          setSavedPlaces(
            likedData.likedDestinations.map(
              (d: { id: number; name: string; description?: string }) => ({
                id: d.id,
                name: d.name,
                description: d.description,
                image_url: undefined,
              })
            )
          )
        } else {
          setSavedPlaces([])
        }
      } else {
        setSavedPlaces([])
      }
    } catch {
      setSavedPlaces([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    loadStatsAndSavedPlaces()
  }, [user?.id, loadStatsAndSavedPlaces])

  useEffect(() => {
    if (!mounted) return
    const load = async () => {
      if (user && user.id && user.id !== 'admin') {
        try {
          const res = await fetch(`/api/itineraries?userId=${user.id}`)
          const data = await res.json()

          if (data.success && Array.isArray(data.itineraries)) {
            setSavedItineraries(data.itineraries)
            return
          }
        } catch (e) {}
      }

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

  const deleteItinerary = async (id: string) => {
    setDeletingId(id)
    try {
      const updated = savedItineraries.filter((it) => String(it.id) !== String(id))
      setSavedItineraries(updated)

      if (user && user.id && user.id !== 'admin') {
        const res = await fetch('/api/itineraries', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, routeId: id }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          const isNotFound = data.message?.includes('not found') || data.message?.includes('access denied')
          if (isNotFound) {
            localStorage.setItem('savedItineraries', JSON.stringify(updated))
          } else {
            setSavedItineraries(savedItineraries)
            alert(data.message || 'Neizdevās izdzēst maršrutu.')
            return
          }
        }
      }
      localStorage.setItem('savedItineraries', JSON.stringify(updated))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('savedItinerariesUpdated'))
      }
    } catch (e) {
      setSavedItineraries(savedItineraries)
      alert('Neizdevās izdzēst maršrutu.')
    } finally {
      setDeletingId(null)
    }
  }

  if (!user) return null

  return (
    <>
      <section className="relative h-[40vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light">Profils</h1>
          <p className="mt-4 text-xl">Jūsu konts un statistika</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                <h2 className="text-2xl font-light mb-6 text-gray-800">Konta informācija</h2>
                <div className="mb-4">
                  <span className="block text-sm text-gray-500">Vārds:</span>
                  <span className="text-lg font-medium text-gray-900">{user.name}</span>
                </div>
                <div className="mb-4">
                  <span className="block text-sm text-gray-500">E-pasts:</span>
                  <span className="text-lg font-medium text-gray-900">{user.email}</span>
                </div>
                <div className="mb-6">
                  <span className="block text-sm text-gray-500">Loma:</span>
                  <span className="text-lg font-medium text-gray-900">
                    {isAdmin() ? "Administrators" : "Lietotājs"}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="w-full rounded-md bg-red-600 py-3 px-4 text-white transition-colors hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Izrakstīties
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 mb-6">
                <h2 className="text-2xl font-light mb-6 text-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  Jūsu statistika
                </h2>

                {loading ? (
                  <p className="text-gray-600">Ielādē statistiku...</p>
                ) : stats ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <span className="text-sm text-gray-600">Saglabātās vietas</span>
                      </div>
                      <p className="text-3xl font-light text-blue-600">{stats.savedDestinations}</p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-md border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Route className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-gray-600">Izveidotie maršruti</span>
                      </div>
                      <p className="text-3xl font-light text-green-600">{stats.routesCreated}</p>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm text-gray-600">Uzrakstītās atsauksmes</span>
                      </div>
                      <p className="text-3xl font-light text-yellow-600">{stats.reviewsWritten}</p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-md border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-purple-600" />
                        <span className="text-sm text-gray-600">Vidējais vērtējums</span>
                      </div>
                      <p className="text-3xl font-light text-purple-600">
                        {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
                      </p>
                    </div>

                    {stats.citiesVisited !== undefined && (
                      <div className="p-4 bg-amber-50 rounded-md border border-amber-200">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-5 w-5 text-amber-600" />
                          <span className="text-sm text-gray-600">Apmeklētās pilsētas</span>
                        </div>
                        <p className="text-3xl font-light text-amber-600">{stats.citiesVisited}</p>
                      </div>
                    )}
                    {stats.totalKm !== undefined && stats.totalKm > 0 && (
                      <div className="p-4 bg-teal-50 rounded-md border border-teal-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Route className="h-5 w-5 text-teal-600" />
                          <span className="text-sm text-gray-600">Kopā km</span>
                        </div>
                        <p className="text-3xl font-light text-teal-600">{stats.totalKm}</p>
                      </div>
                    )}
                    {stats.totalSpent !== undefined && stats.totalSpent > 0 && (
                      <div className="p-4 bg-emerald-50 rounded-md border border-emerald-200">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-5 w-5 text-emerald-600" />
                          <span className="text-sm text-gray-600">Kopā iztērēts</span>
                        </div>
                        <p className="text-3xl font-light text-emerald-600">{stats.totalSpent}€</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">Statistika vēl nav pieejama</p>
                )}
              </div>

              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 mb-6">
                <h3 className="text-xl font-light mb-4 text-gray-800 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Saglabātās vietas
                </h3>
                {savedPlaces.length > 0 ? (
                  <div className="space-y-3">
                    {savedPlaces.map((d) => (
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
                              loadStatsAndSavedPlaces()
                            }}
                          />
                          <Link
                            href={`/destination/${d.id}`}
                            className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                          >
                            Skatīt
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600">Vēl nav nevienas saglabātas vietas</p>
                    <Link href="/destinations" className="inline-block mt-2 text-blue-600 hover:underline text-sm">
                      Izpētīt galamērķus
                    </Link>
                  </>
                )}
              </div>

              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 mb-6">
                <h3 className="text-xl font-light mb-4 text-gray-800 flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  Saglabātie maršruti
                </h3>
                {savedItineraries.length > 0 ? (
                  <div className="space-y-3">
                    {savedItineraries.slice(0, 5).map((it: any) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                      >
                        <Link href={`/itinerary?route=${it.id}`} className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">
                            {it.kind === 'tripPlan' && it.tripName
                              ? it.tripName
                              : `${it.startPoint} → ${it.endPoint}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {it.distance} km · {Math.floor(it.time || 0)} st. {Math.round(((it.time || 0) % 1) * 60)} min.
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {it.date ? new Date(it.date).toLocaleDateString('lv-LV') : ''}
                          </p>
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            deleteItinerary(it.id)
                          }}
                          disabled={deletingId === String(it.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                          title="Dzēst maršrutu"
                          aria-label="Dzēst maršrutu"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {savedItineraries.length > 5 && (
                      <Link
                        href="/itinerary"
                        className="block text-center text-blue-600 hover:underline text-sm py-2"
                      >
                        Skatīt visus {savedItineraries.length} sadaļā Maršruti
                      </Link>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600">Vēl nav neviena saglabāta maršruta</p>
                    <Link href="/itinerary" className="inline-block mt-2 text-blue-600 hover:underline text-sm">
                      Plānot braucienu
                    </Link>
                  </>
                )}
              </div>

              {stats && (
                <>
                  {stats.favoriteCategory && (
                    <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 mb-6">
                      <h3 className="text-xl font-light mb-4 text-gray-800">Iecienītākā kategorija</h3>
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
                      <h3 className="text-xl font-light mb-4 text-gray-800">Iecienītākais reģions</h3>
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
                    <h3 className="text-xl font-light mb-4 text-gray-800">Ātrās darbības</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link
                        href="/itinerary"
                        className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="font-medium mb-1">Plānot jaunu maršrutu</h4>
                        <p className="text-sm text-gray-600">Izveidojiet plānu no savām saglabātajām vietām</p>
                      </Link>
                      <Link
                        href="/compare"
                        className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="font-medium mb-1">Salīdzināt galamērķus</h4>
                        <p className="text-sm text-gray-600">Salīdziniet līdz pat 3 vietām</p>
                      </Link>
                      <Link
                        href="/destinations"
                        className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="font-medium mb-1">Izpētīt vairāk</h4>
                        <p className="text-sm text-gray-600">Atklājiet jaunus galamērķus</p>
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