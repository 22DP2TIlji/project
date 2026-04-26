"use client"

import { useState } from "react"
import Link from "next/link"
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
  { id: "nature", name: "Nature" },
  { id: "castle", name: "Castles" },
  { id: "park", name: "Parks" },
  { id: "beach", name: "Beaches" },
  { id: "city", name: "City" },
  { id: "viewing_tower", name: "Viewing towers" },
]

export default function TripPlannerPage() {
  const [days, setDays] = useState(2)
  const [interests, setInterests] = useState<string[]>([])
  const [budget, setBudget] = useState("")
  const [startCity, setStartCity] = useState("riga")
  const [loading, setLoading] = useState(false)
  const [trip, setTrip] = useState<any>(null)

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
        alert(data.message || "Failed to generate trip")
      }
    } catch (e) {
      console.error(e)
      alert("Failed to generate trip")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section className="relative h-[35vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-light">Smart Trip Planner</h1>
          <p className="mt-3 text-lg text-gray-600">
            Build your route by days, interests, and budget
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 mb-8">
            <h2 className="text-xl font-light mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Trip options
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of days
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
                  Start city
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
                  Interests (optional)
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
                  Max budget (€, optional)
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 200"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full max-w-[150px] p-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                onClick={generate}
                disabled={loading}
                className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    Generate route
                  </>
                )}
              </button>
            </div>
          </div>

          {trip && (
            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
              <h2 className="text-xl font-light mb-4">Your route</h2>
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                <span>{trip.totalPlaces} places</span>
                <span>~{trip.totalDistance} km</span>
                {trip.estimatedCost > 0 && (
                  <span>~{trip.estimatedCost}€</span>
                )}
              </div>
              <div className="space-y-6">
                {trip.tripDays.map((day: any) => (
                  <div key={day.dayNumber} className="border-l-2 border-blue-200 pl-4">
                    <h3 className="font-medium text-gray-800 mb-2">
                      Day {day.dayNumber}
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
              <Link
                href="/itinerary"
                className="inline-block mt-6 text-blue-600 hover:underline"
              >
                Save and plan on map →
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
