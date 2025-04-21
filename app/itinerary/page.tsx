"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Search, Clock, Navigation } from "lucide-react"

// Dynamically import the Map component with no SSR
const ItineraryMap = dynamic(() => import("@/components/itinerary-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 rounded-md">
      <p>Loading map...</p>
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

export default function ItineraryPage() {
  const [startPoint, setStartPoint] = useState("")
  const [endPoint, setEndPoint] = useState("")
  const [customStartPoint, setCustomStartPoint] = useState("")
  const [customEndPoint, setCustomEndPoint] = useState("")
  const [route, setRoute] = useState<any>(null)
  const [savedItineraries, setSavedItineraries] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)

    // Load saved itineraries from localStorage
    const saved = localStorage.getItem("savedItineraries")
    if (saved) {
      setSavedItineraries(JSON.parse(saved))
    }
  }, [])

  // Find coordinates for selected destinations
  const getCoordinates = (pointId: string) => {
    const destination = popularDestinations.find((dest) => dest.id === pointId)
    return destination ? destination.coordinates : null
  }

  // Calculate a simple route (in a real app, you'd use a routing API)
  const calculateRoute = () => {
    let start = getCoordinates(startPoint)
    let end = getCoordinates(endPoint)

    // If using custom points, parse them
    if (startPoint === "custom" && customStartPoint) {
      const [lat, lng] = customStartPoint.split(",").map((coord) => Number.parseFloat(coord.trim()))
      if (!isNaN(lat) && !isNaN(lng)) {
        start = [lat, lng]
      }
    }

    if (endPoint === "custom" && customEndPoint) {
      const [lat, lng] = customEndPoint.split(",").map((coord) => Number.parseFloat(coord.trim()))
      if (!isNaN(lat) && !isNaN(lng)) {
        end = [lat, lng]
      }
    }

    if (!start || !end) {
      alert("Please select valid start and end points")
      return
    }

    // Calculate a straight line route (simplified)
    const newRoute = {
      startPoint:
        startPoint === "custom" ? "Custom location" : popularDestinations.find((d) => d.id === startPoint)?.name,
      endPoint: endPoint === "custom" ? "Custom location" : popularDestinations.find((d) => d.id === endPoint)?.name,
      startCoords: start,
      endCoords: end,
      // Simple distance calculation (in km)
      distance: calculateDistance(start[0], start[1], end[0], end[1]),
      // Estimate time (assuming 60 km/h average speed)
      time: calculateDistance(start[0], start[1], end[0], end[1]) / 60,
    }

    setRoute(newRoute)
  }

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in km
    return Math.round(distance * 10) / 10
  }

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180)
  }

  // Save the current itinerary
  const saveItinerary = () => {
    if (!route) return

    const newItinerary = {
      id: Date.now().toString(),
      ...route,
      date: new Date().toISOString(),
    }

    const updatedItineraries = [...savedItineraries, newItinerary]
    setSavedItineraries(updatedItineraries)
    localStorage.setItem("savedItineraries", JSON.stringify(updatedItineraries))
    alert("Itinerary saved successfully!")
  }

  // Delete a saved itinerary
  const deleteItinerary = (id: string) => {
    const updatedItineraries = savedItineraries.filter((itinerary) => itinerary.id !== id)
    setSavedItineraries(updatedItineraries)
    localStorage.setItem("savedItineraries", JSON.stringify(updatedItineraries))
  }

  return (
    <>
      <section className="relative h-[40vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200">{/* Placeholder for background image */}</div>
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
                <h2 className="text-2xl font-light mb-6">Route Planner</h2>

                <div className="mb-4">
                  <label htmlFor="startPoint" className="block mb-2 text-sm font-medium">
                    Starting Point
                  </label>
                  <select
                    id="startPoint"
                    value={startPoint}
                    onChange={(e) => setStartPoint(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md"
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
                      className="w-full p-3 border border-gray-300 rounded-md"
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
                    className="w-full p-3 border border-gray-300 rounded-md"
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
                      className="w-full p-3 border border-gray-300 rounded-md"
                    />
                  </div>
                )}

                <button
                  onClick={calculateRoute}
                  className="w-full py-3 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
                  disabled={!startPoint || !endPoint}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Calculate Route
                </button>

                {route && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-md">
                    <h3 className="font-medium mb-2">Route Details</h3>
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
                        <strong>Est. Time:</strong> {Math.floor(route.time)} hours {Math.round((route.time % 1) * 60)}{" "}
                        minutes
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
                  <h2 className="text-2xl font-light mb-4">Saved Itineraries</h2>
                  <div className="space-y-3">
                    {savedItineraries.map((itinerary) => (
                      <div key={itinerary.id} className="p-3 border border-gray-200 rounded-md">
                        <div className="flex justify-between">
                          <h4 className="font-medium">
                            {itinerary.startPoint} to {itinerary.endPoint}
                          </h4>
                          <button onClick={() => deleteItinerary(itinerary.id)} className="text-red-500 text-sm">
                            Delete
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">{new Date(itinerary.date).toLocaleDateString()}</p>
                        <p className="text-sm">
                          {itinerary.distance} km • {Math.floor(itinerary.time)} hours{" "}
                          {Math.round((itinerary.time % 1) * 60)} minutes
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              {isClient && <ItineraryMap route={route} destinations={popularDestinations} />}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
