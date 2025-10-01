"use client"

import { useEffect, useState } from "react"

interface ItineraryMapProps {
  route: any
  destinations: any[]
}

export default function ItineraryMap({ route, destinations }: ItineraryMapProps) {
  const [map, setMap] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const loadMap = async () => {
      try {
        const L = (await import("leaflet")).default

        await import("leaflet/dist/leaflet.css")

        delete (L.Icon.Default.prototype as any)._getIconUrl

        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        })

        const center: [number, number] = [56.8796, 24.6032]
        const zoom = 7

        if (!map) {
          const mapInstance = L.map("map").setView(center, zoom)

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(mapInstance)

          setMap(mapInstance)
        }
      } catch (error) {
        console.error("Error loading map:", error)
      }
    }

    loadMap()

    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [isClient, map])

  useEffect(() => {
    if (!isClient || !map) return

    const updateMap = async () => {
      try {
        const L = (await import("leaflet")).default

        map.eachLayer((layer: any) => {
          if (layer instanceof L.Marker || layer instanceof L.Polyline) {
            map.removeLayer(layer)
          }
        })

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)

        destinations.forEach((destination) => {
          L.marker(destination.coordinates as [number, number])
            .addTo(map)
            .bindPopup(destination.name)
        })

        if (route && route.startCoords && route.endCoords) {
          L.marker(route.startCoords as [number, number])
            .addTo(map)
            .bindPopup(`Start: ${route.startPoint}`)

          L.marker(route.endCoords as [number, number])
            .addTo(map)
            .bindPopup(`End: ${route.endPoint}`)

          L.polyline([route.startCoords, route.endCoords], {
            color: "blue",
            weight: 4,
            opacity: 0.7,
          }).addTo(map)

          map.fitBounds([route.startCoords, route.endCoords], {
            padding: [50, 50],
          })
        }
      } catch (error) {
        console.error("Error updating map:", error)
      }
    }

    updateMap()
  }, [map, destinations, route, isClient])

  if (!isClient) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
        <p className="text-gray-600">Loading map...</p>
      </div>
    )
  }

  return (
    <div
      id="map"
      className="h-[600px] w-full rounded-md overflow-hidden border border-gray-200 shadow-sm bg-gray-100"
    ></div>
  )
}
