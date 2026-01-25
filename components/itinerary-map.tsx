"use client"

import { useEffect, useState } from "react"

interface ItineraryMapProps {
  route: any
  destinations: any[]
}

export default function ItineraryMap({ route, destinations }: ItineraryMapProps) {
  const [map, setMap] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  // храним routing control, чтобы удалять/обновлять
  const [routingControl, setRoutingControl] = useState<any>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const loadMap = async () => {
      try {
        const L = (await import("leaflet")).default

        

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
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(mapInstance)

          setMap(mapInstance)
        }
      } catch (error) {
        console.error("Error loading map:", error)
      }
    }

    loadMap()

    return () => {
      if (map) map.remove()
    }
  }, [isClient, map])

  useEffect(() => {
    if (!isClient || !map) return

    const updateMap = async () => {
      try {
        const L = (await import("leaflet")).default

        // подключаем routing machine динамически
        await import("leaflet-routing-machine")
        

        // 1) Удаляем старые маркеры/линии
        map.eachLayer((layer: any) => {
          if (layer instanceof L.Marker || layer instanceof L.Polyline) {
            map.removeLayer(layer)
          }
        })

        // 2) Удаляем старый routing control (если был)
        if (routingControl) {
          map.removeControl(routingControl)
          setRoutingControl(null)
        }

        // 3) (опционально) Не добавляй tileLayer повторно — он уже есть при создании карты
        // Если хочешь оставить - будет дублироваться, поэтому убираем повторное добавление.

        // 4) Маркеры точек (популярные места)
        destinations.forEach((destination) => {
          L.marker(destination.coordinates as [number, number])
            .addTo(map)
            .bindPopup(destination.name)
        })

        // 5) Маршрут по дороге (если выбраны start/end)
        if (route && route.startCoords && route.endCoords) {
          L.marker(route.startCoords as [number, number])
            .addTo(map)
            .bindPopup(`Start: ${route.startPoint}`)

          L.marker(route.endCoords as [number, number])
            .addTo(map)
            .bindPopup(`End: ${route.endPoint}`)

          const control = (L as any).Routing.control({
            waypoints: [
              L.latLng(route.startCoords[0], route.startCoords[1]),
              L.latLng(route.endCoords[0], route.endCoords[1]),
            ],
            router: (L as any).Routing.osrmv1({
              serviceUrl: "https://router.project-osrm.org/route/v1",
            }),
            lineOptions: {
              styles: [{ weight: 5, opacity: 0.8 }],
            },
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            show: false, // скрыть панель
          }).addTo(map)

          setRoutingControl(control)
        }
      } catch (error) {
        console.error("Error updating map:", error)
      }
    }

    updateMap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
