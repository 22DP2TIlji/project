"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { MapPin, Calendar, Wallet, Heart, Loader2 } from "lucide-react"

const CITIES = [
  { id: "riga", name: "Rīga" },
  { id: "jurmala", name: "Jūrmala" },
  { id: "sigulda", name: "Sigulda" },
  { id: "cesis", name: "Cēsis" },
  { id: "kuldiga", name: "Kuldīga" },
  { id: "liepaja", name: "Liepāja" },
  { id: "daugavpils", name: "Daugavpils" },
  { id: "ventspils", name: "Ventspils" },
]

const CATEGORIES = [
  { id: "nature", name: "Daba" },
  { id: "castle", name: "Pilis" },
  { id: "park", name: "Parki" },
  { id: "beach", name: "Pludmales" },
  { id: "city", name: "Pilsēta" },
  { id: "viewing_tower", name: "Skatu torņi" },
]

export default function TripPlannerPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [days, setDays] = useState(2)
  const [interests, setInterests] = useState<string[]>([])
  const [budget, setBudget] = useState("")
  const [startCity, setStartCity] = useState("riga")
  const [loading, setLoading] = useState(false)
  const [trip, setTrip] = useState<any>(null)
  const [tripNotice, setTripNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const tripDays = Array.isArray(trip?.tripDays) ? trip.tripDays : []

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const generate = async () => {
    if (!isAuthenticated || !user?.id || user?.id === "admin") {
      router.push("/login?message=" + encodeURIComponent("Lai veiktu šo darbību, vispirms pieslēdzieties."))
      return
    }

    const userId = user.id

    setLoading(true)
    setTrip(null)
    setTripNotice('')
    try {
      const res = await fetch("/api/trip-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          days,
          interests: interests.length ? interests : undefined,
          budget: budget ? parseFloat(budget) : undefined,
          startCity,
        }),
      })
      const data = await res.json()
      if (data.success && data.trip) {
        setTrip(data.trip)
         if (Number(data.trip.totalPlaces || 0) === 0) {
          setTripNotice('Norādītajā budžetā neizdevās atrast piemērotas vietas. Palieliniet budžetu vai samaziniet dienu skaitu.')
        } else if (budget && Number(data.trip.estimatedCost || 0) <= Number(budget)) {
          setTripNotice(`Maršruts iekļaujas norādītajā budžetā: ~${data.trip.estimatedCost}€ no ${budget}€.`)
        }
      } else {
        alert(data.message || "Neizdevās izveidot ceļojumu")
      }
    } catch (e) {
      console.error(e)
      alert("Neizdevās izveidot ceļojumu")
    } finally {
      setLoading(false)
    }
  }

  const saveAndPlanOnMap = async () => {
    if (!trip) return
    if (!isAuthenticated || !user?.id || user.id === "admin") {
      router.push("/login?message=" + encodeURIComponent("Lai veiktu šo darbību, vispirms pieslēdzieties."))
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/trip-planner/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          tripName: `Ceļojums no ${CITIES.find((c) => c.id === startCity)?.name || "Latvijas"}`,
          trip,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success || !data.routeId) {
        alert(data.message || "Neizdevās saglabāt ceļojumu.")
        return
      }
      window.dispatchEvent(new CustomEvent("savedItinerariesUpdated"))
      router.push(`/itinerary?route=${data.routeId}&openMap=1`)
    } catch (error) {
      console.error(error)
      alert("Neizdevās saglabāt ceļojumu.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <section className="travel-hero">
        <div className="travel-hero-glow" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <h1 className="travel-hero-title">Gudrais ceļojuma plānotājs</h1>
          <p className="travel-hero-subtitle">
            Veidojiet maršrutu pēc dienām, interesēm un budžeta
          </p>
        </div>
      </section>

      <section className="travel-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 mb-8">
            <h2 className="text-xl font-light mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Ceļojuma iestatījumi
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dienu skaits
                </label>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={days}
                  onChange={(e) => setDays(Math.max(1, Math.min(14, parseInt(e.target.value) || 1)))}
                  className="w-full max-w-[120px] p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sākuma pilsēta
                </label>
                <select
                  value={startCity}
                  onChange={(e) => setStartCity(e.target.value)}
                  className="w-full max-w-[200px] p-2 border border-gray-300 rounded-md"
                >
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intereses (nav obligāti)
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleInterest(c.id)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        interests.includes(c.id)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Wallet className="h-4 w-4" />
                  Maksimālais budžets (€)
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="piem. 200"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full max-w-[150px] p-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                onClick={generate}
                disabled={loading || isLoading || !isAuthenticated || !user || user.id === "admin"}
                className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Veido...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    {user && user.id !== "admin" ? "Izveidot maršrutu" : "Pieslēdzieties, lai veidotu"}
                  </>
                )}
              </button>
            </div>
          </div>
          {tripNotice && (
            <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              {tripNotice}
            </div>
          )}

          {trip && (
            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
              <h2 className="text-xl font-light mb-4">Jūsu maršruts</h2>
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                <span>{trip.totalPlaces} vietas</span>
                <span>~{trip.totalDistance} km</span>
                {trip.estimatedCost > 0 && (
                  <span>~{trip.estimatedCost}€</span>
                )}
                 {budget && (
                  <span>Budžets: {budget}€</span>
                )}
              </div>
              <div className="space-y-6">
                {tripDays.map((day: any) => (
                  <div key={day.dayNumber} className="border-l-2 border-blue-200 pl-4">
                    <h3 className="font-medium text-gray-800 mb-2">
                      Diena {day.dayNumber}
                    </h3>
                    <ul className="space-y-1">
                      {(Array.isArray(day.places) ? day.places : []).map((p: any, i: number) => (
                        <li key={p.id || i} className="flex items-start gap-2">
                          <Heart className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <Link
                              href={`/destination/${p.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {p.name}
                            </Link>
                            {p.city && (
                              <span className="text-gray-500 text-sm ml-1">
                                ({p.city})
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={saveAndPlanOnMap}
                disabled={saving || !isAuthenticated || !user || user.id === "admin"}
                className="inline-block mt-6 text-blue-600 hover:underline disabled:opacity-50"
              >
                {saving ? "Saglabā..." : isAuthenticated && user?.id !== "admin" ? "Saglabāt un plānot kartē →" : "Pieslēdzieties, lai saglabātu"}
                </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
