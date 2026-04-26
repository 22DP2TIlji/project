"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { MapPin, Calendar, Wallet, Heart, Loader2, Save } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

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
  { id: "castle", name: "Pilis un muižas" },
  { id: "park", name: "Parki" },
  { id: "beach", name: "Pludmales" },
  { id: "city", name: "Pilsētvide" },
  { id: "viewing_tower", name: "Skatu torņi" },
]

export default function TripPlannerPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tripName, setTripName] = useState("")
  const [days, setDays] = useState(2)
  const [interests, setInterests] = useState<string[]>([])
  const [budget, setBudget] = useState("")
  const [startCity, setStartCity] = useState("riga")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [trip, setTrip] = useState<any>(null)
  const routeIdFromUrl = searchParams.get("route")

  useEffect(() => {
    if (!routeIdFromUrl) return
    const numericId = parseInt(routeIdFromUrl, 10)
    if (!Number.isFinite(numericId)) return

    fetch(`/api/itineraries/${numericId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.itinerary?.kind === "tripPlan") {
          setTrip(data.itinerary)
          setTripName(data.itinerary.tripName || "")
        }
      })
      .catch((error) => console.error("Neizdevās ielādēt maršrutu:", error))
  }, [routeIdFromUrl])

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const generate = async () => {
    setLoading(true)
    setTrip(null)
    try {
      const res = await fetch("/api/trip-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days,
          interests: interests.length ? interests : undefined,
          budget: budget ? parseFloat(budget) : undefined,
          startCity,
        }),
      })
      const data = await res.json()
      if (data.success && data.trip) {
        setTrip(data.trip)
      } else {
        alert(data.message || "Neizdevās izveidot ceļojuma plānu.")
      }
    } catch (e) {
      console.error(e)
      alert("Neizdevās izveidot ceļojuma plānu.")
    } finally {
      setLoading(false)
    }
  }

  const saveTrip = async () => {
    if (!trip) return
    if (!isAuthenticated || !user?.id || user.id === "admin") {
      alert("Lūdzu, piesakieties, lai saglabātu savu ceļojumu.")
      router.push("/login")
      return
    }
    const name = tripName.trim()
    if (!name) {
      alert("Lūdzu, ievadiet ceļojuma nosaukumu.")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/trip-planner/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          tripName: name,
          trip,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        alert(data.message || "Neizdevās saglabāt ceļojumu.")
        return
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("savedItinerariesUpdated"))
      }
      router.push(`/itinerary?route=${data.routeId}`)
    } catch (e) {
      console.error(e)
      alert("Neizdevās saglabāt ceļojumu.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <section className="relative h-[35vh] bg-gradient-to-br from-blue-100 via-sky-50 to-emerald-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gradient-to-r from-white/30 to-white/10" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-light">Viedais ceļojumu plānotājs</h1>
          <p className="mt-3 text-lg text-gray-600">
            Izveidojiet savu maršrutu pa Latviju, balstoties uz savām vēlmēm
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 mb-8">
            <h2 className="text-xl font-light mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Ceļojuma uzstādījumi
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
                  Intereses (pēc izvēles)
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
                  placeholder="piem., 200"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full max-w-[150px] p-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                onClick={generate}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Ģenerē maršrutu...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    Izveidot maršrutu
                  </>
                )}
              </button>
            </div>
          </div>

          {trip && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 animate-in fade-in duration-500">
              <h2 className="text-xl font-light mb-4">Jūsu maršruts</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ceļojuma nosaukums (saglabāšanai profilā)
                </label>
                <input
                  type="text"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  placeholder="piem., Brīvdienas Kurzemē"
                  className="w-full max-w-md p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                <span>{trip.totalPlaces} vietas</span>
                <span>~{trip.totalDistance} km</span>
                {trip.estimatedCost > 0 && (
                  <span>~{trip.estimatedCost}€</span>
                )}
              </div>
              <div className="space-y-6">
                {trip.tripDays.map((day: any) => (
                  <div key={day.dayNumber} className="border-l-2 border-blue-200 pl-4">
                    <h3 className="font-medium text-gray-800 mb-2">
                      {day.dayNumber}. diena
                    </h3>
                    <ul className="space-y-1">
                      {day.places.map((p: any, i: number) => (
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
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={saveTrip}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Saglabāt un atvērt kartē
                </button>
                <Link href="/itinerary" className="text-sm text-gray-600 hover:text-blue-600 underline">
                  Atvērt tikai maršruta plānotāju
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}