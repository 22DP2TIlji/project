"use client"

import { useEffect, useState } from "react"
import L from "leaflet"

// Define the props interface
interface ItineraryMapProps {
  route: any
  destinations: any[]
}

export default function ItineraryMap({ route, destinations }: ItineraryMapProps) {
  const [map, setMap] = useState<L.Map | null>(null)

  // Initialize the map on component mount
  useEffect(() => {
    // Import Leaflet CSS
    import("leaflet/dist/leaflet.css")

    // Only run this code in the browser
    if (typeof window !== "undefined") {
      // Fix Leaflet default icon issues
      const { icon } = L
      delete (L as any).Icon.Default.prototype._getIconUrl

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      })

      // Center of Latvia
      const center: [number, number] = [56.8796, 24.6032]
      const zoom = 7

      // Initialize map if it doesn't exist
      if (!map) {
        const mapInstance = L.map("map").setView(center, zoom)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance)

        setMap(mapInstance)
      }
    }

    // Cleanup function to remove the map when component unmounts
    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [])

  // Update markers and routes when they change
  useEffect(() => {
    if (!map) return

    // Clear existing markers and routes
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer)
      }
    })

    // Add base tile layer back if it was removed
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    // Add destination markers
    destinations.forEach((destination) => {
      const marker = L.marker(destination.coordinates as [number, number])
        .addTo(map)
        .bindPopup(destination.name)
    })

    // Add route if available
    if (route && route.startCoords && route.endCoords) {
      // Start marker
      L.marker(route.startCoords as [number, number])
        .addTo(map)
        .bindPopup(`Start: ${route.startPoint}`)

      // End marker
      L.marker(route.endCoords as [number, number])
        .addTo(map)
        .bindPopup(`End: ${route.endPoint}`)

      // Route line
      L.polyline([route.startCoords, route.endCoords], {
        color: "blue",
        weight: 4,
        opacity: 0.7,
      }).addTo(map)

      // Fit map to show the route
      map.fitBounds([route.startCoords, route.endCoords], {
        padding: [50, 50],
      })
    }
  }, [map, destinations, route])

  return <div id="map" className="h-[600px] w-full rounded-md overflow-hidden border border-gray-200 shadow-sm"></div>
}
