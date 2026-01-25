// app/itinerary/page.tsx
"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Search, Clock, Navigation } from "lucide-react"

const ItineraryMap = dynamic(() => import("@/components/itinerary-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 rounded-md">
      <p className="text-gray-600">Loading map...</p>
    </div>
  ),
})

const popularDestinations = [
  { id: "riga", name: "Riga", coordinates: [56.9496, 24.1052] },
  { id: "jurmala", name: "Jūrmala", coordinates: [56.9715, 23.7408] },
  { id: "sigulda", name: "Sigulda", coordinates: [57.1537, 24.8598] },
  { id: "cesis", name: "Cēsis", coordinates: [57.3119, 25.2749] },
  { id: "kuldiga", name: "Kuldīga", coordinates: [56.9677, 21.9617] },
  { id: "liepaja", name: "Liepāja", coordinates: [56.5047, 21.0107] },
  { id: "daugavpils", name: "Daugavpils", coordinates: [55.8714, 26.5161] },
  { id: "ventspils", name: "Ventspils", coordinates: [57.3894, 21.5606] },
]

function getUserIdFromLocalStorage(): string | null {
  try {
    const raw = localStorage.getItem("user")
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.id ? String(parsed.id) : null
  } catch {
    return null
  }
}

export default function ItineraryPage() {
  const [startPoint, setStartPoint] = useState("")
  const [endPoint, setEndPoint] = useState("")
  const [customStartPoint, setCustomStartPoint] = useState("")
  const [customEndPoint, setCustomEndPoint] = useState("")
  const [route, setRoute] = useState<any>(null)

  const [savedItineraries, setSavedItineraries] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // ✅ Load itineraries for logged in user from DB
  const loadSavedItineraries = async () => {
    const userId = getUserIdFromLocalStorage()
    if (!userId) {
      setSavedItineraries([])
      return
    }

    const res = await fetch(`/api/itineraries?id=${encodeURIComponent(userId)}`, {
      method: "GET",
      cache: "no-store",
    })

    const data = await res.json()
    if (!res.ok || !data.success) {
      console.error("Failed to load itineraries:", data)
      setSavedItineraries([])
      return
    }

    setSavedItineraries(data.itineraries ?? [])
  }

  useEffect(() => {
    if (!isClient) return
    loadSavedItineraries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient])

  const getCoordinates = (pointId: string) => {
    const destination = popularDestinations.find((dest) => dest.id === pointId)
    return destination ? destination.coordinates : null
  }

  const calculateRoute = () => {
    try {
      let start = getCoordinates(startPoint)
      let end = getCoordinates(endPoint)

      if (startPoint === "custom" && customStartPoint) {
        const [lat, lng] = customStartPoint.split(",").map((coord) => Number.parseFloat(coord.trim()))
        if (!isNaN(lat) && !isNaN(lng)) start = [lat, lng]
      }

      if (endPoint === "custom" && customEndPoint) {
        const [lat, lng] = customEndPoint.split(",").map((coord) => Number.parseFloat(coord.trim()))
        if (!isNaN(lat) && !isNaN(lng)) end = [lat, lng]
      }

      if (!start || !end) {
        alert("Please select valid start and end points")
        return
      }

      const dist = calculateDistance(start[0], start[1], end[0], end[1])

      const newRoute = {
        startPoint: startPoint === "custom" ? "Custom location" : popularDestinations.find((d) => d.id === startPoint)?.name,
        endPoint: endPoint === "custom" ? "Custom location" : popularDestinations.find((d) => d.id === endPoint)?.name,
        startCoords: start,
        endCoords: end,
        distance: dist,
        time: dist / 60,
      }

      setRoute(newRoute)
    } catch (error) {
      console.error("Error calculating route:", error)
      alert("An error occurred while calculating the route. Please try again.")
    }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Math.round(R * c * 10) / 10
  }

  const deg2rad = (deg: number) => deg * (Math.PI / 180)

  const saveItinerary = async () => {
    try {
      if (!route) return

      const userId = getUserIdFromLocalStorage()
      if (!userId) {
        alert("Please log in first.")
        return
      }

      const res = await fetch("/api/itineraries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          route: {
            startPoint: route.startPoint,
            endPoint: route.endPoint,
            startCoords: route.startCoords,
            endCoords: route.endCoords,
            distance: route.distance,
            time: route.time,
          },
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        alert(data?.message || "Failed to save itinerary")
        return
      }

      alert("Itinerary saved to your account ✅")
      await loadSavedItineraries()
    } catch (error) {
      console.error("Error saving itinerary:", error)
      alert("An error occurred while saving the itinerary.")
    }
  }

  const deleteItinerary = async (itineraryId: string) => {
  try {
    const userId = getUserIdFromLocalStorage()
    if (!userId) {
      alert("Please log in first.")
      return
    }

    const res = await fetch(`/api/itineraries/${encodeURIComponent(itineraryId)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId }), // ваш стиль
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.success) {
      alert(data?.message || "Failed to delete itinerary")
      return
    }

    await loadSavedItineraries()
  } catch (error) {
    console.error("Error deleting itinerary:", error)
    alert("An error occurred while deleting the itinerary.")
  }
}


  return (
    <>
      <section className="relative h-[40vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light">Plan Your Itinerary</h1>
          <p className="mt-4 text-xl">Create your perfect route through Latvia</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                <h2 className="text-2xl font-light mb-6 text-gray-800">Route Planner</h2>

                <div className="mb-4">
                  <label htmlFor="startPoint" className="block mb-2 text-sm font-medium">
                    Starting Point
                  </label>
                  <select
                    id="startPoint"
                    value={startPoint}
                    onChange={(e) => setStartPoint(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  >
                    <option value="">Select starting point</option>
                    {popularDestinations.map((dest) => (
                      <option key={`start-${dest.id}`} value={dest.id}>
                        {dest.name}
                      </option>
                    ))}
                    <option value="custom">Custom location</option>
                  </select>
                </div>

                {startPoint === "custom" && (
                  <div className="mb-4">
                    <label htmlFor="customStartPoint" className="block mb-2 text-sm font-medium">
                      Custom Starting Point (lat, lng)
                    </label>
                    <input
                      type="text"
                      id="customStartPoint"
                      value={customStartPoint}
                      onChange={(e) => setCustomStartPoint(e.target.value)}
                      placeholder="e.g. 56.9496, 24.1052"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="endPoint" className="block mb-2 text-sm font-medium">
                    Destination
                  </label>
                  <select
                    id="endPoint"
                    value={endPoint}
                    onChange={(e) => setEndPoint(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  >
                    <option value="">Select destination</option>
                    {popularDestinations.map((dest) => (
                      <option key={`end-${dest.id}`} value={dest.id}>
                        {dest.name}
                      </option>
                    ))}
                    <option value="custom">Custom location</option>
                  </select>
                </div>

                {endPoint === "custom" && (
                  <div className="mb-4">
                    <label htmlFor="customEndPoint" className="block mb-2 text-sm font-medium">
                      Custom Destination (lat, lng)
                    </label>
                    <input
                      type="text"
                      id="customEndPoint"
                      value={customEndPoint}
                      onChange={(e) => setCustomEndPoint(e.target.value)}
                      placeholder="e.g. 57.3119, 25.2749"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>
                )}

                <button
                  onClick={calculateRoute}
                  className="w-full py-3 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!startPoint || !endPoint}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Calculate Route
                </button>

                {route && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h3 className="font-medium mb-2 text-gray-800">Route Details</h3>
                    <p className="text-sm mb-1">
                      <strong>From:</strong> {route.startPoint}
                    </p>
                    <p className="text-sm mb-1">
                      <strong>To:</strong> {route.endPoint}
                    </p>
                    <div className="flex items-center text-sm mb-1">
                      <Navigation className="w-4 h-4 mr-1" />
                      <span>
                        <strong>Distance:</strong> {route.distance} km
                      </span>
                    </div>
                    <div className="flex items-center text-sm mb-3">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>
                        <strong>Est. Time:</strong> {Math.floor(route.time)} hours {Math.round((route.time % 1) * 60)} minutes
                      </span>
                    </div>
                    <button
                      onClick={saveItinerary}
                      className="w-full py-2 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Save Itinerary
                    </button>
                  </div>
                )}
              </div>

              {isClient && savedItineraries.length > 0 && (
                <div className="mt-6 bg-white p-6 rounded-md shadow-sm border border-gray-200">
                  <h2 className="text-2xl font-light mb-4 text-gray-800">Saved Itineraries</h2>
                  <div className="space-y-3">
                    {savedItineraries.map((itinerary) => (
                      <div key={itinerary.id} className="p-3 border border-gray-200 rounded-md bg-gray-50">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-gray-800">
                            {itinerary.startPoint} to {itinerary.endPoint}
                          </h4>
                          <button onClick={() => deleteItinerary(String(itinerary.id))} className="text-red-500 text-sm">
                            Delete
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">
                          {itinerary.createdAt ? new Date(itinerary.createdAt).toLocaleDateString() : ""}
                        </p>
                        <p className="text-sm">
                          {Number(itinerary.distanceKm ?? 0)} km • {itinerary.timeMin ?? 0} minutes
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2">{isClient && <ItineraryMap route={route} destinations={popularDestinations} />}</div>
          </div>
        </div>
      </section>
    </>
  )
}
