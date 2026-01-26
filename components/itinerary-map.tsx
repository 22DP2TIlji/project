"use client"

import { useEffect, useState } from "react"

interface ItineraryMapProps {
  route: any
  destinations: any[]
  nearbyPlaces?: any[]
}

export default function ItineraryMap({ route, destinations, nearbyPlaces = [] }: ItineraryMapProps) {
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

        // @ts-expect-error - leaflet CSS has no type declarations
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
          const mapInstance = L.map("itinerary-map").setView(center, zoom)

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
          if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Circle) {
            map.removeLayer(layer)
          }
        })

        destinations.forEach((destination) => {
          L.marker(destination.coordinates as [number, number])
            .addTo(map)
            .bindPopup(destination.name)
        })

        if (route && route.startCoords && route.endCoords) {
          // Start marker
          L.marker(route.startCoords as [number, number], {
            icon: L.icon({
              iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
              shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            }),
          })
            .addTo(map)
            .bindPopup(`Start: ${route.startPoint}`)

          // End marker
          L.marker(route.endCoords as [number, number], {
            icon: L.icon({
              iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
              shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            }),
          })
            .addTo(map)
            .bindPopup(`End: ${route.endPoint}`)

          // Route line
          L.polyline([route.startCoords, route.endCoords], {
            color: "blue",
            weight: 4,
            opacity: 0.7,
          }).addTo(map)

          const places = Array.isArray(nearbyPlaces) ? nearbyPlaces : []
          places.forEach((place) => {
            const lat = Number(place.latitude)
            const lng = Number(place.longitude)
            
            let iconColor = "blue"
            if (place.type === "accommodation") iconColor = "orange"
            if (place.type === "event") iconColor = "violet"

            L.marker([lat, lng], {
              icon: L.icon({
                iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${iconColor}.png`,
                shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                iconSize: [20, 32],
                iconAnchor: [10, 32],
              }),
            })
              .addTo(map)
              .bindPopup(
                `<strong>${place.name}</strong><br/>${place.type}<br/>${place.distance?.toFixed(1) || 0} km away`
              )
          })

          const bounds = [route.startCoords, route.endCoords, ...places.map((p: any) => [Number(p.latitude), Number(p.longitude)])]
          map.fitBounds(bounds as any, {
            padding: [50, 50],
          })
        } else {
          // Если нет маршрута, показываем все destinations
          if (destinations.length > 0) {
            const bounds = destinations.map((d) => d.coordinates)
            map.fitBounds(bounds as any, {
              padding: [50, 50],
            })
          }
        }
      } catch (error) {
        console.error("Error updating map:", error)
      }
    }

    updateMap()
  }, [map, destinations, route, nearbyPlaces, isClient])

  if (!isClient) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
        <p className="text-gray-600">Loading map...</p>
      </div>
    )
  }

  return (
    <div
      id="itinerary-map"
      className="h-[600px] w-full rounded-md overflow-hidden border border-gray-200 shadow-sm bg-gray-100"
    ></div>
  )
}
