"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Search, Clock, Navigation, MapPin, Download, Hotel, Calendar, X, Calendar as CalendarIcon, Printer, Share2, FileText } from "lucide-react"

function ItineraryMapLoadingPlaceholder() {
  return (
    <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 rounded-md">
      <p className="text-gray-600">Ielādē karti...</p>
    </div>
  )
}

const ItineraryMap = dynamic(() => import("@/components/itinerary-map"), {
  ssr: false,
  loading: () => <ItineraryMapLoadingPlaceholder />,
})

const popularDestinations = [
  { id: "riga", name: "Rīga", coordinates: [56.9496, 24.1052] },
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
  const searchParams = useSearchParams()
  const [startPoint, setStartPoint] = useState("")
  const [endPoint, setEndPoint] = useState("")
  const [customStartPoint, setCustomStartPoint] = useState("")
  const [customEndPoint, setCustomEndPoint] = useState("")
  const [route, setRoute] = useState<any>(null)
  const [savedItineraries, setSavedItineraries] = useState<any[]>([])
  const [savedItinerariesLoaded, setSavedItinerariesLoaded] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([])
  const [loadingNearby, setLoadingNearby] = useState(false)
  const [searchRadius, setSearchRadius] = useState("50")
  const [showNearby, setShowNearby] = useState(false)
  const [isPublic, setIsPublic] = useState(false)

  const routeIdFromUrl = searchParams.get("route")

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const loadSavedItineraries = async () => {
      if (user && user.id) {
        setSavedItinerariesLoaded(false)
        try {
          const res = await fetch(`/api/itineraries?userId=${user.id}`)
          const data = await res.json()

          if (data.success && Array.isArray(data.itineraries)) {
            setSavedItineraries(data.itineraries)
            setSavedItinerariesLoaded(true)
            return
          }
        } catch (error) {
          console.error("Kļūda, ielādējot lietotāja maršrutus:", error)
        }
      }

      try {
        const saved = localStorage.getItem("savedItineraries")
        setSavedItineraries(saved ? JSON.parse(saved) : [])
      } catch (error) {
        console.error("Kļūda, ielādējot saglabātos maršrutus no localStorage:", error)
        setSavedItineraries([])
      } finally {
        setSavedItinerariesLoaded(true)
      }
    }

    loadSavedItineraries()
  }, [user, isClient, routeIdFromUrl])

  const mapDestinations = useMemo(() => {
    if (!route || route.kind !== "tripPlan" || !Array.isArray(route.tripDays)) {
      return popularDestinations
    }
    const out: { id: string | number; name: string; coordinates: [number, number] }[] = []
    let idx = 0
    for (const day of route.tripDays) {
      for (const p of day.places || []) {
        if (p?.latitude != null && p?.longitude != null) {
          out.push({
            id: p.id ?? `d${day.dayNumber}-${idx++}`,
            name: `Diena ${day.dayNumber}: ${p.name}`,
            coordinates: [Number(p.latitude), Number(p.longitude)],
          })
        }
      }
    }
    return out.length > 0 ? out : popularDestinations
  }, [route])

  useEffect(() => {
    if (!routeIdFromUrl || !savedItinerariesLoaded) return
    const found = savedItineraries.find(
      (it: any) => String(it.id) === String(routeIdFromUrl)
    )
    if (found && found.startCoords && found.endCoords) {
      setRoute(found)
      setShowNearby(true)
      return
    }

    const numericId = parseInt(routeIdFromUrl, 10)
    if (!Number.isFinite(numericId)) return
    fetch(`/api/itineraries/${numericId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.itinerary && data.itinerary.startCoords && data.itinerary.endCoords) {
          setRoute(data.itinerary)
          setShowNearby(true)
        }
      })
      .catch(console.error)
  }, [routeIdFromUrl, savedItineraries, savedItinerariesLoaded])

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
      console.error("Kļūda, ielādējot tuvumā esošās vietas:", error)
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
        alert("Lūdzu, izvēlieties derīgus sākuma un galamērķa punktus.")
        return
      }
  
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
        console.error("Maršruta aprēķins pa ceļiem neizdevās, izmantojam taisno līniju:", e)
      }
  
      const newRoute = {
        startPoint:
          startPoint === "custom" ? "Pielāgota vieta" : popularDestinations.find((d) => d.id === startPoint)?.name,
        endPoint:
          endPoint === "custom" ? "Pielāgota vieta" : popularDestinations.find((d) => d.id === endPoint)?.name,
        startCoords: start,
        endCoords: end,
        distance: distanceRoad ?? calculateDistance(start[0], start[1], end[0], end[1]),
        timeMinutes: timeMinutesRoad ?? null,
        time: timeMinutesRoad != null ? timeMinutesRoad / 60 : calculateDistance(start[0], start[1], end[0], end[1]) / 60,
        geometry,
      }
  
      setRoute(newRoute)
      setShowNearby(true)
    } catch (error) {
      console.error("Kļūda, aprēķinot maršrutu:", error)
      alert("Neizdevās aprēķināt maršrutu.")
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
            const msg = data?.message || "Neizdevās saglabāt maršrutu."
            alert(msg)
            return
          }
        } catch (error) {
          console.error("Kļūda, saglabājot maršrutu datubāzē:", error)
          alert("Neizdevās saglabāt maršrutu.")
          return
        }
      } else {
        try {
          const updatedGuestItineraries = [...savedItineraries, baseItinerary]
          localStorage.setItem("savedItineraries", JSON.stringify(updatedGuestItineraries))
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("savedItinerariesUpdated"))
          }
        } catch (error) {
          console.error("Kļūda, saglabājot maršrutu localStorage:", error)
        }
      }

      const updatedItineraries = [...savedItineraries, savedForState]
      setSavedItineraries(updatedItineraries)
      alert("Maršruts veiksmīgi saglabāts!")
    } catch (error) {
      console.error("Kļūda, saglabājot maršrutu:", error)
      alert("Kļūda, saglabājot maršrutu.")
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
          startDate: new Date().toISOString(),
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
        alert("Neizdevās eksportēt uz iCal.")
      }
} catch (error) {
    console.error('Kļūda, eksportējot uz iCal:', error)
    alert("Eksportēšana neizdevās.")
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
          <title>Maršruts: ${route.startPoint} līdz ${route.endPoint}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .route-info { margin: 20px 0; }
            .place { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <h1>Maršruts: ${route.startPoint} līdz ${route.endPoint}</h1>
          <div class="route-info">
            <p><strong>Attālums:</strong> ${route.distance} km</p>
            <p><strong>Aptuvenais laiks:</strong> ${Math.floor(route.time)} stundas ${Math.round((route.time % 1) * 60)} minūtes</p>
          </div>
          ${nearbyPlaces.length > 0 ? `
            <h2>Vietas maršruta tuvumā (${nearbyPlaces.length})</h2>
            ${nearbyPlaces.map((p: any) => `
              <div class="place">
                <h3>${p.name} (${p.type})</h3>
                <p>${p.description || ''}</p>
                <p>Attālums: ${p.distance?.toFixed(1) || 0} km</p>
              </div>
            `).join('')}
          ` : ''}
          <p style="margin-top: 40px; color: #666; font-size: 12px;">
            Izveidots ar TravelLatvia ${new Date().toLocaleString()}
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
      title: `Maršruts: ${route.startPoint} līdz ${route.endPoint}`,
      text: `Apskati šo maršrutu: ${route.startPoint} līdz ${route.endPoint}. Attālums: ${route.distance} km, Laiks: ${Math.floor(route.time)} stundas`,
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

    const text = `Maršruts: ${route.startPoint} līdz ${route.endPoint}\nAttālums: ${route.distance} km\nLaiks: ${Math.floor(route.time)} stundas\n\nSkatīt TravelLatvia: ${window.location.href}`
    navigator.clipboard.writeText(text).then(() => {
      alert("Maršruts nokopēts starpliktuvē.")
    })
  }

  const togglePublish = async (itinerary: { id: string; isPublic?: boolean }) => {
    if (!user || !user.id || user.id === "admin") return
    const routeId = parseInt(itinerary.id)
    if (!Number.isFinite(routeId)) return

    const nextPublic = !itinerary.isPublic
    setSavedItineraries((prev) =>
      prev.map((it) =>
        it.id === itinerary.id ? { ...it, isPublic: nextPublic } : it
      )
    )
    try {
      const res = await fetch(`/api/itineraries/${routeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, isPublic: nextPublic }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setSavedItineraries((prev) =>
          prev.map((it) =>
            it.id === itinerary.id ? { ...it, isPublic: !!itinerary.isPublic } : it
          )
        )
        alert(data.message || "Neizdevās atjaunināt.")
      }
      if (data.success && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("savedItinerariesUpdated"))
      }
    } catch (e) {
      setSavedItineraries((prev) =>
        prev.map((it) =>
          it.id === itinerary.id ? { ...it, isPublic: !!itinerary.isPublic } : it
        )
      )
      alert("Neizdevās atjaunināt.")
    }
  }

  const deleteItinerary = async (id: string) => {
    try {
      const idStr = String(id)
      const updatedItineraries = savedItineraries.filter(
        (itinerary) => String(itinerary.id) !== idStr
      )
      setSavedItineraries(updatedItineraries)

      if (!user || user.id === "admin") {
        try {
          localStorage.setItem("savedItineraries", JSON.stringify(updatedItineraries))
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("savedItinerariesUpdated"))
          }
        } catch (error) {
          console.error("Kļūda, atjauninot saglabātos maršrutus localStorage:", error)
        }
      } else {
        const res = await fetch("/api/itineraries", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, routeId: idStr }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.success) {
          setSavedItineraries(savedItineraries)
          alert(data.message || "Neizdevās dzēst maršrutu.")
          return
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("savedItinerariesUpdated"))
        }
      }
    } catch (error) {
      console.error("Kļūda, dzēšot maršrutu:", error)
      setSavedItineraries(savedItineraries)
      alert("Neizdevās dzēst maršrutu.")
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
        return "Galamērķis"
      case 'accommodation':
        return "Naktsmītne"
      case 'event':
        return "Pasākums"
      default:
        return "Vieta"
    }
  }

  return (
    <>
      <section className="relative h-[40vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light">Maršruts</h1>
          <p className="mt-4 text-xl">Plāno un saglabā savus maršrutus pa Latviju</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                <h2 className="text-2xl font-light mb-6 text-gray-800">Maršruta plānotājs</h2>

                <div className="mb-4">
                  <label htmlFor="startPoint" className="block mb-2 text-sm font-medium">
                    Sākuma punkts
                  </label>
                  <select
                    id="startPoint"
                    value={startPoint}
                    onChange={(e) => setStartPoint(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  >
                    <option value="">Izvēlieties sākuma punktu</option>
                    {popularDestinations.map((dest) => (
                      <option key={`start-${dest.id}`} value={dest.id}>
                        {dest.name}
                      </option>
                    ))}
                    <option value="custom">Pielāgota vieta</option>
                  </select>
                </div>

                {startPoint === "custom" && (
                  <div className="mb-4">
                    <label htmlFor="customStartPoint" className="block mb-2 text-sm font-medium">
                      Pielāgotas sākuma koordinātas (plat., gar.)
                    </label>
                    <input
                      type="text"
                      id="customStartPoint"
                      value={customStartPoint}
                      onChange={(e) => setCustomStartPoint(e.target.value)}
                      placeholder="piem. 56.9496, 24.1052"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="endPoint" className="block mb-2 text-sm font-medium">
                    Galamērķis
                  </label>
                  <select
                    id="endPoint"
                    value={endPoint}
                    onChange={(e) => setEndPoint(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  >
                    <option value="">Izvēlieties galamērķi</option>
                    {popularDestinations.map((dest) => (
                      <option key={`end-${dest.id}`} value={dest.id}>
                        {dest.name}
                      </option>
                    ))}
                    <option value="custom">Pielāgota vieta</option>
                  </select>
                </div>

                {endPoint === "custom" && (
                  <div className="mb-4">
                    <label htmlFor="customEndPoint" className="block mb-2 text-sm font-medium">
                      Pielāgotas galapunkta koordinātas (plat., gar.)
                    </label>
                    <input
                      type="text"
                      id="customEndPoint"
                      value={customEndPoint}
                      onChange={(e) => setCustomEndPoint(e.target.value)}
                      placeholder="piem. 57.3119, 25.2749"
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
                  Aprēķināt maršrutu
                </button>

                {route && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h3 className="font-medium mb-2 text-gray-800">Maršruta informācija</h3>
                    <p className="text-sm mb-1">
                      <strong>No</strong> {route.startPoint}
                    </p>
                    <p className="text-sm mb-1">
                      <strong>Uz</strong> {route.endPoint}
                    </p>
                    <div className="flex items-center text-sm mb-1">
                      <Navigation className="w-4 h-4 mr-1" />
                      <span>
                        <strong>Attālums</strong> {route.distance} km
                      </span>
                    </div>
                    <div className="flex items-center text-sm mb-3">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>
                        <strong>Apt. laiks</strong> {Math.floor(route.time)} stundas {Math.round((route.time % 1) * 60)}{" "}
                        minūtes
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={saveItinerary}
                          className="flex-1 py-2 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Saglabāt
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                      </div>
                      <button
                        onClick={shareRoute}
                        className="w-full py-2 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                      >
                        <Share2 className="h-4 w-4" />
                        Kopīgot maršrutu
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
                        Kopīgot publiski
                      </label>
                    </div>
                  </div>
                )}

                {route && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                    <label className="block mb-2 text-sm font-medium text-gray-800">
                      Meklēšanas rādiuss (km)
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
                      Vietas {searchRadius} km rādiusā ap maršrutu
                    </p>
                  </div>
                )}
              </div>

              {isClient && savedItineraries.length > 0 && (
                <div className="mt-6 bg-white p-6 rounded-md shadow-sm border border-gray-200">
                  <h2 className="text-2xl font-light mb-4 text-gray-800">Saglabātie maršruti</h2>
                  <div className="space-y-3">
                    {savedItineraries.map((itinerary) => (
                      <div key={itinerary.id} className="p-3 border border-gray-200 rounded-md bg-gray-50">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-gray-800">
                            {itinerary.kind === "tripPlan" && itinerary.tripName
                              ? itinerary.tripName
                              : `${itinerary.startPoint} līdz ${itinerary.endPoint}`}
                          </h4>
                          <div className="flex items-center gap-2">
                            {user && user.id && user.id !== "admin" && Number.isFinite(parseInt(itinerary.id)) && (
                              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!itinerary.isPublic}
                                  onChange={() => togglePublish(itinerary)}
                                  className="rounded border-gray-300"
                                />
                                <span className="text-gray-600">Publisks</span>
                              </label>
                            )}
                            <button onClick={() => deleteItinerary(itinerary.id)} className="text-red-500 text-sm">
                              Dzēst
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{new Date(itinerary.date).toLocaleDateString()}</p>
                        <p className="text-sm">
                          {itinerary.distance} km • {Math.floor(itinerary.time)} stundas{" "}
                          {Math.round((itinerary.time % 1) * 60)} minūtes
                        </p>
                        {itinerary.isPublic && (
                          <p className="text-xs text-green-600 mt-1">Publicēts</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              {isClient && route?.kind === "tripPlan" && Array.isArray(route.tripDays) && (
                <div className="mb-6 bg-white p-6 rounded-md shadow-sm border border-gray-200">
                  <h2 className="text-2xl font-light text-gray-800 mb-2">
                    {route.tripName || route.startPoint || "Saglabāts ceļojums"}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    {route.totalPlaces != null && `${route.totalPlaces} vietas`}
                    {route.distance != null && ` · ${route.distance} km`}
                    {route.estimatedCost != null && Number(route.estimatedCost) > 0 && ` · ~${route.estimatedCost}€`}
                  </p>
                  <div className="space-y-6">
                    {route.tripDays.map((day: { dayNumber: number; places: any[] }) => (
                      <div key={day.dayNumber} className="border-l-2 border-blue-400 pl-4">
                        <h3 className="font-medium text-gray-800 mb-2">Diena {day.dayNumber}</h3>
                        <ul className="space-y-2">
                          {(day.places || []).map((p: any, i: number) => (
                            <li key={p.id ?? i} className="text-sm text-gray-700 flex items-start gap-2">
                              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
                              <span>
                                <Link href={`/destination/${p.id}`} className="text-blue-600 hover:underline font-medium">
                                  {p.name}
                                </Link>
                                {p.city && <span className="text-gray-500"> ({p.city})</span>}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {isClient && (
                <ItineraryMap
                  route={route}
                  destinations={mapDestinations}
                  nearbyPlaces={Array.isArray(nearbyPlaces) ? nearbyPlaces : []}
                />
              )}
              
              {route && showNearby && (
                <div className="mt-6 bg-white p-6 rounded-md shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-light text-gray-800">
                      Vietas maršruta tuvumā ({nearbyPlaces.length})
                    </h2>
                    <button
                      onClick={() => setShowNearby(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {loadingNearby ? (
                    <p className="text-gray-600">Ielādē tuvumā esošās vietas...</p>
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
                                  {place.distance.toFixed(1)} km attālumā
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
                                <p className="text-sm text-gray-600 mt-1">Cena: {place.priceRange}</p>
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
                                Skatīt
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Nav atrasta neviena vieta {searchRadius} km rādiusā</p>
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