"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

interface ItineraryMapProps {
  route: any
  destinations: any[]
}

export default function ItineraryMap({ route, destinations }: ItineraryMapProps) {
  const [isMounted, setIsMounted] = useState(false)

  // Center of Latvia
  const center: [number, number] = [56.8796, 24.6032]
  const zoom = 7

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="h-[600px] w-full rounded-md overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Display markers for all popular destinations */}
        {destinations.map((destination) => (
          <Marker key={destination.id} position={destination.coordinates as [number, number]}>
            <Popup>{destination.name}</Popup>
          </Marker>
        ))}

        {/* Display route if available */}
        {route && route.startCoords && route.endCoords && (
          <>
            <Marker position={route.startCoords as [number, number]}>
              <Popup>Start: {route.startPoint}</Popup>
            </Marker>
            <Marker position={route.endCoords as [number, number]}>
              <Popup>End: {route.endPoint}</Popup>
            </Marker>
            <Polyline
              positions={[route.startCoords as [number, number], route.endCoords as [number, number]]}
              color="blue"
              weight={4}
              opacity={0.7}
            />
          </>
        )}
      </MapContainer>
    </div>
  )
}
