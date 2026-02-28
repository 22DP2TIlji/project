"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Search, Clock, Navigation, MapPin, Download, Hotel, Calendar, X, Calendar as CalendarIcon, Printer, Share2, FileText } from "lucide-react"

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

interface NearbyPlace {
  id: number
  name: string
  description?: string
  distance: number
  latitude: number | string
  longitude: number | string
  category?: string
  address?: string
  priceRange?: string
  startDate?: string
  endDate?: string
  type: 'destination' | 'accommodation' | 'event'
}

export default function ItineraryPage() {
  const { user } = useAuth()
  const [startPoint, setStartPoint] = useState("")
  const [endPoint, setEndPoint] = useState("")
  const [customStartPoint, setCustomStartPoint] = useState("")
  const [customEndPoint, setCustomEndPoint] = useState("")
  const [route, setRoute] = useState<any>(null)
  const [savedItineraries, setSavedItineraries] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([])
  const [loadingNearby, setLoadingNearby] = useState(false)
  const [searchRadius, setSearchRadius] = useState("50") // радиус в км
  const [showNearby, setShowNearby] = useState(false)
  const [notes, setNotes] = useState("")
  const [startDate, setStartDate] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [budget, setBudget] = useState({ transport: 0, accommodation: 0, food: 0, entertainment: 0 })

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const loadSavedItineraries = async () => {
      // Если пользователь авторизован — грузим маршруты из БД для конкретного аккаунта
      if (user && user.id) {
        try {
          const res = await fetch(`/api/itineraries?userId=${user.id}`)
          const data = await res.json()

          if (data.success && Array.isArray(data.itineraries)) {
            setSavedItineraries(data.itineraries)
            return
          }
        } catch (error) {
          console.error("Error loading user itineraries:", error)
        }
      }

      // Гостевой режим или запасной вариант — читаем из localStorage
      try {
        const saved = localStorage.getItem("savedItineraries")
        setSavedItineraries(saved ? JSON.parse(saved) : [])
      } catch (error) {
        console.error("Error loading saved itineraries from localStorage:", error)
        setSavedItineraries([])
      }
    }

    loadSavedItineraries()
  }, [user, isClient])

  useEffect(() => {
    if (route && route.startCoords && route.endCoords) {
      loadNearbyPlaces()
    } else {
      setNearbyPlaces([])
      setShowNearby(false)
    }
  }, [route, searchRadius])

  const loadNearbyPlaces = async () => {
    if (!route || !route.startCoords || !route.endCoords) return

    setLoadingNearby(true)
    try {
      const params = new URLSearchParams({
        routeStartLat: route.startCoords[0].toString(),
        routeStartLng: route.startCoords[1].toString(),
        routeEndLat: route.endCoords[0].toString(),
        routeEndLng: route.endCoords[1].toString(),
        radius: searchRadius,
        type: 'all',
      })

      const res = await fetch(`/api/nearby?${params}`)
      const data = await res.json()

      if (data.success) {
        const places: NearbyPlace[] = []
        
        if (data.destinations) {
          places.push(...data.destinations.map((d: any) => ({
            id: d.id,
            name: d.name,
            description: d.description,
            distance: d.distance,
            latitude: d.latitude,
            longitude: d.longitude,
            category: d.category,
            type: 'destination' as const,
          })))
        }

        if (data.accommodations) {
          places.push(...data.accommodations.map((a: any) => ({
            id: a.id,
            name: a.name,
            description: a.description,
            distance: a.distance,
            latitude: a.latitude,
            longitude: a.longitude,
            address: a.address,
            priceRange: a.priceRange,
            category: a.category,
            type: 'accommodation' as const,
          })))
        }

        if (data.events) {
          places.push(...data.events.map((e: any) => ({
            id: e.id,
            name: e.name,
            description: e.description,
            distance: e.distance,
            latitude: e.latitude,
            longitude: e.longitude,
            startDate: e.startDate,
            endDate: e.endDate,
            category: e.category,
            type: 'event' as const,
          })))
        }

        setNearbyPlaces(places.sort((a, b) => a.distance - b.distance))
      }
    } catch (error) {
      console.error("Error loading nearby places:", error)
    } finally {
      setLoadingNearby(false)
    }
  }

  const getCoordinates = (pointId: string) => {
    const destination = popularDestinations.find((dest) => dest.id === pointId)
    return destination ? destination.coordinates : null
  }

  const calculateRoute = async () => {
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
  
      // ✅ ДОБАВИЛИ: получаем маршрут по дорогам (geometry)
      let geometry = null
      let distanceRoad = null
      let timeMinutesRoad = null
  
      try {
        const params = new URLSearchParams({
          startLat: String(start[0]),
          startLng: String(start[1]),
          endLat: String(end[0]),
          endLng: String(end[1]),
        })
  
        const rr = await fetch(`/api/route?${params}`)
        const rdata = await rr.json()
  
        if (rdata?.success) {
          geometry = rdata.geometry
          distanceRoad = rdata.distanceKm
          timeMinutesRoad = rdata.timeMinutes
        }
      } catch (e) {
        console.error("Road routing failed, fallback to straight line:", e)
      }
  
      const newRoute = {
        startPoint:
          startPoint === "custom" ? "Custom location" : popularDestinations.find((d) => d.id === startPoint)?.name,
        endPoint:
          endPoint === "custom" ? "Custom location" : popularDestinations.find((d) => d.id === endPoint)?.name,
        startCoords: start,
        endCoords: end,
  
        // ✅ если есть данные по дорогам — используем их, иначе оставляем твою старую формулу
        distance: distanceRoad ?? calculateDistance(start[0], start[1], end[0], end[1]),
        timeMinutes: timeMinutesRoad ?? null,
        time: timeMinutesRoad != null ? timeMinutesRoad / 60 : calculateDistance(start[0], start[1], end[0], end[1]) / 60,
  
        // ✅ добавили geometry, остальное не ломаем
        geometry,
      }
  
      setRoute(newRoute)
      setShowNearby(true)
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
    const distance = R * c
    return Math.round(distance * 10) / 10
  }

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180)
  }

  const saveItinerary = async () => {
    try {
      if (!route) return

      const baseItinerary = {
        id: Date.now().toString(),
        ...route,
        date: new Date().toISOString(),
        isPublic,
      }

      let savedForState = baseItinerary

      // Если пользователь авторизован (и не admin) — сохраняем маршрут в БД, привязав к userId
      if (user && user.id && user.id !== "admin") {
        try {
          const response = await fetch("/api/itineraries", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              itinerary: baseItinerary,
            }),
          })

          const data = await response.json().catch(() => ({}))
          if (response.ok && data.success && data.routeId) {
            savedForState = {
              ...baseItinerary,
              id: data.routeId.toString(),
            }
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("savedItinerariesUpdated"))
            }
          } else {
            const msg = data?.message || `Failed to save route (${response.status})`
            alert(msg)
            return
          }
        } catch (error) {
          console.error("Error saving itinerary to database:", error)
          alert("Could not save route. Check your connection.")
          return
        }
      } else {
        // Гостевой режим или admin — сохраняем только в localStorage (без привязки к аккаунту)
        try {
          const updatedGuestItineraries = [...savedItineraries, baseItinerary]
          localStorage.setItem("savedItineraries", JSON.stringify(updatedGuestItineraries))
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("savedItinerariesUpdated"))
          }
        } catch (error) {
          console.error("Error saving itinerary to localStorage:", error)
        }
      }

      const updatedItineraries = [...savedItineraries, savedForState]
      setSavedItineraries(updatedItineraries)
      alert("Itinerary saved successfully!")
    } catch (error) {
      console.error("Error saving itinerary:", error)
      alert("An error occurred while saving the itinerary. Please try again.")
    }
  }

  const exportItinerary = () => {
    if (!route) return

    const exportData = {
      route: {
        start: route.startPoint,
        end: route.endPoint,
        startCoords: route.startCoords,
        endCoords: route.endCoords,
        distance: route.distance,
        estimatedTime: route.time,
      },
      nearbyPlaces: nearbyPlaces,
      notes: notes,
      exportedAt: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `itinerary-${route.startPoint}-${route.endPoint}-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportToICal = async () => {
    if (!route) return

    try {
      const response = await fetch('/api/export/ical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route,
          places: nearbyPlaces,
          startDate: startDate || new Date().toISOString(),
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `route-${route.startPoint}-${route.endPoint}.ics`
        link.click()
        URL.revokeObjectURL(url)
      } else {
        alert('Failed to export to iCal format')
      }
    } catch (error) {
      console.error('Error exporting to iCal:', error)
      alert('An error occurred while exporting')
    }
  }

  const printRoute = () => {
    if (!route) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Route: ${route.startPoint} to ${route.endPoint}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .route-info { margin: 20px 0; }
            .place { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <h1>Route: ${route.startPoint} to ${route.endPoint}</h1>
          <div class="route-info">
            <p><strong>Distance:</strong> ${route.distance} km</p>
            <p><strong>Estimated Time:</strong> ${Math.floor(route.time)} hours ${Math.round((route.time % 1) * 60)} minutes</p>
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          </div>
          ${nearbyPlaces.length > 0 ? `
            <h2>Places Near Route (${nearbyPlaces.length})</h2>
            ${nearbyPlaces.map((p: any) => `
              <div class="place">
                <h3>${p.name} (${p.type})</h3>
                <p>${p.description || ''}</p>
                <p>Distance: ${p.distance?.toFixed(1) || 0} km</p>
              </div>
            `).join('')}
          ` : ''}
          <p style="margin-top: 40px; color: #666; font-size: 12px;">
            Generated by TravelLatvia on ${new Date().toLocaleString()}
          </p>
        </body>
      </html>
    `
    printWindow.document.write(content)
    printWindow.document.close()
    printWindow.print()
  }

  const shareRoute = () => {
    if (!route) return

    const shareData = {
      title: `Route: ${route.startPoint} to ${route.endPoint}`,
      text: `Check out this route: ${route.startPoint} to ${route.endPoint}. Distance: ${route.distance} km, Time: ${Math.floor(route.time)} hours`,
      url: window.location.href,
    }

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        copyToClipboard()
      })
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = () => {
    if (!route) return

    const text = `Route: ${route.startPoint} to ${route.endPoint}\nDistance: ${route.distance} km\nTime: ${Math.floor(route.time)} hours\n\nView on TravelLatvia: ${window.location.href}`
    navigator.clipboard.writeText(text).then(() => {
      alert('Route link copied to clipboard!')
    })
  }

  const deleteItinerary = async (id: string) => {
    try {
      const updatedItineraries = savedItineraries.filter((itinerary) => itinerary.id !== id)
      setSavedItineraries(updatedItineraries)

      // Если пользователь не залогинен — поддерживаем старое поведение через localStorage
      if (!user) {
        try {
          localStorage.setItem("savedItineraries", JSON.stringify(updatedItineraries))
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("savedItinerariesUpdated"))
          }
        } catch (error) {
          console.error("Error updating saved itineraries in localStorage:", error)
        }
      } else {
        // Авторизованный пользователь — удаляем маршрут в БД
        try {
          await fetch("/api/itineraries", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              routeId: id,
            }),
          })
        } catch (error) {
          console.error("Error deleting itinerary from database:", error)
        }
      }
    } catch (error) {
      console.error("Error deleting itinerary:", error)
      alert("An error occurred while deleting the itinerary. Please try again.")
    }
  }

  const getPlaceIcon = (type: string) => {
    switch (type) {
      case 'destination':
        return <MapPin className="h-4 w-4" />
      case 'accommodation':
        return <Hotel className="h-4 w-4" />
      case 'event':
        return <Calendar className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getPlaceTypeLabel = (type: string) => {
    switch (type) {
      case 'destination':
        return 'Destination'
      case 'accommodation':
        return 'Accommodation'
      case 'event':
        return 'Event'
      default:
        return 'Place'
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
                        <strong>Est. Time:</strong> {Math.floor(route.time)} hours {Math.round((route.time % 1) * 60)}{" "}
                        minutes
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={saveItinerary}
                          className="flex-1 py-2 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Save
                        </button>
                        
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                      </div>
                      <button
                        onClick={shareRoute}
                        className="w-full py-2 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                      >
                        <Share2 className="h-4 w-4" />
                        Share Route
                      </button>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="isPublic" className="text-sm text-gray-700">
                        Share publicly (others can clone this route)
                      </label>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <label className="block text-sm text-gray-700">Transport (€)</label>
                      <input
                        type="number"
                        min={0}
                        value={budget.transport || ""}
                        onChange={(e) => setBudget((b) => ({ ...b, transport: parseFloat(e.target.value) || 0 }))}
                        className="col-start-2 p-2 border rounded"
                        placeholder="0"
                      />
                      <label className="block text-sm text-gray-700">Accommodation (€)</label>
                      <input
                        type="number"
                        min={0}
                        value={budget.accommodation || ""}
                        onChange={(e) => setBudget((b) => ({ ...b, accommodation: parseFloat(e.target.value) || 0 }))}
                        className="col-start-2 p-2 border rounded"
                        placeholder="0"
                      />
                      <label className="block text-sm text-gray-700">Food (€)</label>
                      <input
                        type="number"
                        min={0}
                        value={budget.food || ""}
                        onChange={(e) => setBudget((b) => ({ ...b, food: parseFloat(e.target.value) || 0 }))}
                        className="col-start-2 p-2 border rounded"
                        placeholder="0"
                      />
                      <label className="block text-sm text-gray-700">Entertainment (€)</label>
                      <input
                        type="number"
                        min={0}
                        value={budget.entertainment || ""}
                        onChange={(e) => setBudget((b) => ({ ...b, entertainment: parseFloat(e.target.value) || 0 }))}
                        className="col-start-2 p-2 border rounded"
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="mt-4">
                      <label className="block mb-2 text-sm font-medium text-gray-800">
                        Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about this route..."
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
                      />
                    </div>
                  </div>
                )}

                {route && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                    <label className="block mb-2 text-sm font-medium text-gray-800">
                      Search radius for nearby places (km)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={searchRadius}
                      onChange={(e) => setSearchRadius(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Places within {searchRadius} km from your route will be shown
                    </p>
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
              {isClient && (
                <ItineraryMap
                  route={route}
                  destinations={popularDestinations}
                  nearbyPlaces={Array.isArray(nearbyPlaces) ? nearbyPlaces : []}
                />
              )}
              
              {route && showNearby && (
                <div className="mt-6 bg-white p-6 rounded-md shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-light text-gray-800">
                      Places Near Your Route ({nearbyPlaces.length})
                    </h2>
                    <button
                      onClick={() => setShowNearby(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {loadingNearby ? (
                    <p className="text-gray-600">Loading nearby places...</p>
                  ) : nearbyPlaces.length > 0 ? (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {nearbyPlaces.map((place) => (
                        <div
                          key={`${place.type}-${place.id}`}
                          className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {getPlaceIcon(place.type)}
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                  {getPlaceTypeLabel(place.type)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {place.distance.toFixed(1)} km away
                                </span>
                              </div>
                              <h3 className="font-semibold text-gray-800">{place.name}</h3>
                              {place.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{place.description}</p>
                              )}
                              {place.category && (
                                <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                  {place.category}
                                </span>
                              )}
                              {place.type === 'accommodation' && place.priceRange && (
                                <p className="text-sm text-gray-600 mt-1">Price: {place.priceRange}</p>
                              )}
                              {place.type === 'event' && place.startDate && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {new Date(place.startDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            {place.type === 'destination' && (
                              <Link
                                href={`/destination/${place.id}`}
                                className="ml-4 text-sm text-blue-600 hover:underline"
                              >
                                View →
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No places found within {searchRadius} km of your route.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
