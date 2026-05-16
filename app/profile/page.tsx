'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, MapPin, Route, Star, LogOut, TrendingUp, ChevronRight, DollarSign, Trash2, KeyRound } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import LikeButton from '@/components/like-button'
import RandomPlace from '@/components/random-place'


type SavedDestination = { id: number | string; name: string; description?: string; image_url?: string }

export default function ProfilePage() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [savedPlaces, setSavedPlaces] = useState<SavedDestination[]>([])
  const [savedItineraries, setSavedItineraries] = useState<any[]>([])
  const [visitedDestinations, setVisitedDestinations] = useState<SavedDestination[]>([])
  const [likedRoutes, setLikedRoutes] = useState<Array<{ id: number; name: string }>>([])
  const [mounted, setMounted] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

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

        const visitedRes = await fetch(
          `/api/users/visited-destinations?userId=${encodeURIComponent(user.id)}`
        )
        const visitedData = await visitedRes.json()
        if (visitedData.success && Array.isArray(visitedData.visitedDestinations)) {
          setVisitedDestinations(
            visitedData.visitedDestinations.map((d: { id: number; name: string; description?: string }) => ({
              id: d.id,
              name: d.name,
              description: d.description,
            }))
          )
        } else {
          setVisitedDestinations([])
        }

        const likedRoutesRes = await fetch(`/api/users/liked-routes?userId=${encodeURIComponent(user.id)}`)
        const likedRoutesData = await likedRoutesRes.json()
        setLikedRoutes(likedRoutesData.success ? likedRoutesData.routes || [] : [])
      } else {
        setSavedPlaces([])
        setVisitedDestinations([])
        setLikedRoutes([])
      }
    } catch {
      setSavedPlaces([])
      setVisitedDestinations([])
      setLikedRoutes([])
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

       setSavedItineraries([])
      try {
        localStorage.removeItem('savedItineraries')
      } catch {}
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
            if (user && user.id && user.id !== 'admin') {
        localStorage.removeItem('savedItineraries')
      }
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

  const isStrongPassword = (value: string) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value)

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setPasswordMessage('')
    setPasswordError('')

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('Lūdzu, aizpildiet visus paroles laukus.')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Jaunās paroles nesakrīt.')
      return
    }
    if (!isStrongPassword(newPassword)) {
      setPasswordError('Jaunajai parolei jābūt vismaz 8 rakstzīmes garai, ar vienu lielo burtu, vienu ciparu un vienu speciālo simbolu.')
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setPasswordError(data.message || 'Neizdevās nomainīt paroli.')
        return
      }
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setPasswordMessage(data.message || 'Parole veiksmīgi nomainīta.')
    } catch {
      setPasswordError('Neizdevās nomainīt paroli.')
    } finally {
      setChangingPassword(false)
    }
  }

  const visitedDestinationIdSet = new Set(visitedDestinations.map((destination) => String(destination.id)))

  const toggleVisitedDestination = async (destination: SavedDestination) => {
    if (!user?.id || user.id === 'admin') return

    const destinationId = Number(destination.id)
    if (!Number.isFinite(destinationId)) return

    const isVisited = visitedDestinationIdSet.has(String(destination.id))
    const res = await fetch(
      isVisited
        ? `/api/users/visited-destinations/${destinationId}`
        : '/api/users/visited-destinations',
      {
        method: isVisited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, destinationId }),
      }
    )
    const data = await res.json()
    if (!res.ok || !data.success) {
      alert(data.message || 'Neizdevās atjaunināt apmeklējuma statusu.')
      return
    }

    if (isVisited) {
      setVisitedDestinations((prev) => prev.filter((item) => String(item.id) !== String(destination.id)))
    } else {
      setVisitedDestinations((prev) => [destination, ...prev])
    }
  }

  if (!user) return null

  return (
    <>
      <section className="travel-hero">
        <div className="travel-hero-glow" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <span className="eyebrow">Personīgais centrs</span>
          <h1 className="travel-hero-title">Profils</h1>
          <p className="travel-hero-subtitle">Jūsu konts, saglabātie maršruti un ceļojumu statistika vienā pārskatāmā panelī.</p>        </div>
      </section>

      <section className="travel-section">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <div className="lg:col-span-1">
              <div className="profile-panel">
                <h2 className="mb-6 text-2xl font-black text-slate-950">Konta informācija</h2>                <div className="mb-4">
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
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-black text-white transition hover:-translate-y-0.5 hover:bg-red-700"                >
                  <LogOut className="h-4 w-4" />
                  Izrakstīties
                </button>
              </div>

              {user.id !== 'admin' && (
                <div className="profile-panel mt-6">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-950">                    <KeyRound className="h-5 w-5" />
                    Mainīt paroli
                  </h2>
                  <form onSubmit={changePassword} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="currentPassword">Pašreizējā parole</label>
                      <input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="profile-password-input" required />                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="newPassword">Jaunā parole</label>
                       <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="profile-password-input" required />                      <p className="mt-2 text-xs text-gray-600">Vismaz 8 rakstzīmes, viens lielais burts, viens cipars un viens speciālais simbols.</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="confirmNewPassword">Atkārtojiet jauno paroli</label>
                     <input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="profile-password-input" required />                    </div>
                    {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                    {passwordMessage && <p className="text-sm text-green-600">{passwordMessage}</p>}
                    <button type="submit" disabled={changingPassword} className="travel-primary-button w-full disabled:opacity-50">                      {changingPassword ? 'Maina paroli...' : 'Nomainīt paroli'}
                    </button>
                  </form>
                </div>
              )}
            </div>

           <div className="lg:col-span-1">
              <div className="profile-panel mb-6">
                <h2 className="mb-6 flex items-center gap-2 text-2xl font-black text-slate-950">                  <TrendingUp className="h-6 w-6" />
                  Jūsu statistika
                </h2>

                {loading ? (
                  <p className="text-gray-600">Ielādē statistiku...</p>
                ) : stats ? (
                  <div className="profile-stats-grid">
                   <div className="profile-stat border-sky-200 bg-sky-50">                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <span className="text-sm text-gray-600">Saglabātās vietas</span>
                      </div>
                      <p className="text-3xl font-black text-sky-700">{stats.savedDestinations}</p>                    </div>

                    <div className="profile-stat border-emerald-200 bg-emerald-50">
                    <div className="flex items-center gap-2 mb-2">
                        <Route className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-gray-600">Izveidotie maršruti</span>
                      </div>
                      <p className="text-3xl font-black text-emerald-700">{stats.routesCreated}</p>                    </div>

                    <div className="profile-stat border-amber-200 bg-amber-50">                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm text-gray-600">Uzrakstītās atsauksmes</span>
                      </div>
                      <p className="text-3xl font-black text-amber-700">{stats.reviewsWritten}</p>                    </div>

                    <div className="profile-stat border-violet-200 bg-violet-50">                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-purple-600" />
                        <span className="text-sm text-gray-600">Vidējais vērtējums</span>
                      </div>
                      <p className="text-3xl font-black text-violet-700">                        {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
                      </p>
                    </div>

                    {stats.citiesVisited !== undefined && (
                      <div className="profile-stat border-amber-200 bg-amber-50">                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-5 w-5 text-amber-600" />
                          <span className="text-sm text-gray-600">Apmeklētās pilsētas</span>
                        </div>
                        <p className="text-3xl font-black text-amber-700">{stats.citiesVisited}</p>
                        </div>
                    )}
                    {stats.totalKm !== undefined && stats.totalKm > 0 && (
                      <div className="profile-stat border-teal-200 bg-teal-50">                        <div className="flex items-center gap-2 mb-2">
                          <Route className="h-5 w-5 text-teal-600" />
                          <span className="text-sm text-gray-600">Kopā km</span>
                        </div>
                        <p className="text-3xl font-black text-teal-700">{stats.totalKm}</p>
                      </div>
                    )}
                    {stats.totalSpent !== undefined && stats.totalSpent > 0 && (
                      <div className="profile-stat border-emerald-200 bg-emerald-50">                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-5 w-5 text-emerald-600" />
                          <span className="text-sm text-gray-600">Kopā iztērēts</span>
                        </div>
                         <p className="text-3xl font-black text-emerald-700">{stats.totalSpent}€</p>                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">Statistika vēl nav pieejama</p>
                )}
              </div>
              <div className="profile-panel mb-6">
                <h3 className="mb-4 text-xl font-black text-slate-950">Jau apmeklēti galamērķi</h3>                {visitedDestinations.length > 0 ? (
                  <div className="space-y-2">
                    {visitedDestinations.slice(0, 6).map((d) => (
                      <Link key={d.id} href={`/destination/${d.id}`} className="block text-sm text-blue-600 hover:underline">
                        {d.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Vēl nav atzīmētu apmeklētu vietu.</p>
                )}
              </div>

              <div className="profile-panel mb-6">
                <h3 className="mb-4 text-xl font-black text-slate-950">Maršruti, kas jums patīk</h3>                {likedRoutes.length > 0 ? (
                  <div className="space-y-2">
                    {likedRoutes.slice(0, 6).map((r) => (
                      <Link key={r.id} href={`/itinerary?route=${r.id}&openMap=1`} className="block text-sm text-blue-600 hover:underline">
                        {r.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Jūs vēl neesat atzīmējis nevienu publisko maršrutu ar “patīk”.</p>
                )}
              </div>

<div className="profile-panel mb-6">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-950">                  <MapPin className="h-5 w-5" />
                  Saglabātās vietas
                </h3>
                {savedPlaces.length > 0 ? (
                  <div className="space-y-3">
                    {savedPlaces.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                      >
                        <div className="relative w-12 h-12 rounded bg-gray-200 overflow-hidden shrink-0">
                          {d.image_url && (
                            <Image src={d.image_url} alt="" fill sizes="48px" className="object-cover" unoptimized />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                         <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-gray-900 truncate">{d.name}</p>
                            {visitedDestinationIdSet.has(String(d.id)) && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                <CheckCircle2 className="h-3 w-3" />
                                Apmeklēts
                              </span>
                            )}
                          </div>
                          {d.description && (
                            <p className="text-sm text-gray-600 truncate">{d.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleVisitedDestination(d)}
                            className={`text-sm hover:underline ${
                              visitedDestinationIdSet.has(String(d.id)) ? 'text-emerald-700' : 'text-gray-600'
                            }`}
                          >
                            {visitedDestinationIdSet.has(String(d.id)) ? 'Noņemt apmeklējumu' : 'Atzīmēt kā apmeklētu'}
                          </button>
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

               <div className="profile-panel mb-6">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-950">                  <Route className="h-5 w-5" />
                  Saglabātie maršruti
                </h3>
                {savedItineraries.length > 0 ? (
                  <div className="space-y-3">
                    {savedItineraries.slice(0, 5).map((it: any) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                      >
                        <Link href={`/itinerary?route=${it.id}&openMap=1`} className="flex-1 min-w-0">
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
                     <div className="profile-panel mb-6">
                      <h3 className="mb-4 text-xl font-black text-slate-950">Iecienītākā kategorija</h3>                      <p className="text-2xl text-gray-900">{stats.favoriteCategory}</p>
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
                    <div className="profile-panel mb-6">
                      <h3 className="mb-4 text-xl font-black text-slate-950">Iecienītākais reģions</h3>                      <p className="text-2xl text-gray-900">{stats.favoriteRegion}</p>
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

                  <div className="profile-panel">
                    <h3 className="mb-4 text-xl font-black text-slate-950">Ātrās darbības</h3>                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link
                        href="/itinerary"
                        className="rounded-3xl border border-slate-200 bg-white/70 p-5 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50"                      >
                        <h4 className="font-medium mb-1">Plānot jaunu maršrutu</h4>
                        <p className="text-sm text-gray-600">Izveidojiet plānu no savām saglabātajām vietām</p>
                      </Link>
                      <Link
                        href="/compare"
                        className="rounded-3xl border border-slate-200 bg-white/70 p-5 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50"                      >
                        <h4 className="font-medium mb-1">Salīdzināt galamērķus</h4>
                        <p className="text-sm text-gray-600">Salīdziniet līdz pat 3 vietām</p>
                      </Link>
                      <Link
                        href="/destinations"
                        className="rounded-3xl border border-slate-200 bg-white/70 p-5 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50"                      >
                        <h4 className="font-medium mb-1">Izpētīt vairāk</h4>
                        <p className="text-sm text-gray-600">Atklājiet jaunus galamērķus</p>
                      </Link>
                      <div className="md:col-span-2">
                        <RandomPlace />
                      </div>
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