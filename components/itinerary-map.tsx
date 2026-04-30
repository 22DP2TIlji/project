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

        // @ts-expect-error - leaflet CSS nav tipu deklarāciju
        await import("leaflet/dist/leaflet.css")

        delete (L.Icon.Default.prototype as any)._getIconUrl

        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        })

        const center: [number, number] = [56.8796, 24.6032] // Latvijas centrs
        const zoom = 7

        if (!map) {
          const mapInstance = L.map("itinerary-map").setView(center, zoom)

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> autori',
          }).addTo(mapInstance)

          setMap(mapInstance)
        }
      } catch (error) {
        console.error("Kļūda ielādējot karti:", error)
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
          // Sākuma marķieris
          L.marker(route.startCoords as [number, number], {
            icon: L.icon({
              iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
              shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            }),
          })
            .addTo(map)
            .bindPopup(`Sākums: ${route.startPoint}`)

          // Beigu marķieris
          L.marker(route.endCoords as [number, number], {
            icon: L.icon({
              iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
              shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            }),
          })
            .addTo(map)
            .bindPopup(`Galamērķis: ${route.endPoint}`)

          // Maršruta līnija
          let linePoints: [number, number][] | null = null

          if (route?.geometry?.type === "LineString" && Array.isArray(route.geometry.coordinates)) {
            // OSRM geojson: [garums, platums] -> Leaflet: [platums, garums]
            linePoints = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]])
          } else if (route?.startCoords && route?.endCoords) {
            // Rezerves variants: taisna līnija
            linePoints = [route.startCoords, route.endCoords]
          }

          if (linePoints) {
            L.polyline(linePoints, {
              color: "blue",
              weight: 4,
              opacity: 0.7,
            }).addTo(map)
          }

          const places = Array.isArray(nearbyPlaces) ? nearbyPlaces : []
          places.forEach((place) => {
            const lat = Number(place.latitude)
            const lng = Number(place.longitude)
            if (Number.isNaN(lat) || Number.isNaN(lng)) return

            const isEvent = place.type === "event"
            const iconColor = isEvent ? "violet" : "blue"
            const typeLabel = isEvent ? "Pasākums" : "Galamērķis"

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
                `<strong>${place.name}</strong><br/>${typeLabel}<br/>${(place.distance ?? 0).toFixed(1)} km attālumā`
              )
          })

          const bounds: [number, number][] = []
          if (route?.geometry?.type === "LineString" && Array.isArray(route.geometry.coordinates)) {
            route.geometry.coordinates.forEach((c: [number, number]) => {
              bounds.push([c[1], c[0]])
            })
          } else {
            bounds.push(route.startCoords as [number, number], route.endCoords as [number, number])
          }

          destinations.forEach((d) => {
            bounds.push(d.coordinates as [number, number])
          })

          places.forEach((p: any) => {
            bounds.push([Number(p.latitude), Number(p.longitude)])
          })

          if (bounds.length > 0) {
            map.fitBounds(bounds as any, { padding: [50, 50] })
          }
        } else {
          // Ja nav maršruta, rādām visus galamērķus
          if (destinations.length > 0) {
            const bounds = destinations.map((d) => d.coordinates)
            map.fitBounds(bounds as any, {
              padding: [50, 50],
            })
          }
        }
      } catch (error) {
        console.error("Kļūda atjauninot karti:", error)
      }
    }

    updateMap()
  }, [map, destinations, route, nearbyPlaces, isClient])

  if (!isClient) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
        <p className="text-gray-600">Ielādē karti...</p>
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