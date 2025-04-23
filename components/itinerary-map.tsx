"use client"

import { useEffect, useState, useRef } from "react"

// Define the props interface
interface ItineraryMapProps {
  route: any
  destinations: any[]
}

export default function ItineraryMap({ route, destinations }: ItineraryMapProps) {
  const [map, setMap] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize the map on component mount
  useEffect(() => {
    if (!isClient) return

    // Import Leaflet only on client side
    const loadMap = async () => {
      try {
        // Dynamically import Leaflet
        const L = (await import("leaflet")).default

        // Import Leaflet CSS - use a different approach to avoid TypeScript errors
        // This is a workaround for the CSS import issue
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css'
        link.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=='
        link.crossOrigin = ''
        document.head.appendChild(link)

        // Fix Leaflet default icon issues
        delete (L.Icon.Default.prototype as any)._getIconUrl

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
      } catch (error) {
        console.error("Error loading map:", error)
      }
    }

    loadMap()

    // Cleanup function to remove the map when component unmounts
    return () => {
      if (map) {
        map.remove()
      }
      // Clear any animation intervals
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current)
      }
    }
  }, [isClient, map])

  // Update markers and routes when they change
  useEffect(() => {
    if (!isClient || !map) return

    const updateMap = async () => {
      try {
        const L = (await import("leaflet")).default

        // Clear existing markers and routes
        map.eachLayer((layer: any) => {
          if (layer instanceof L.Marker || layer instanceof L.Polyline) {
            map.removeLayer(layer)
          }
        })

        // Clear any existing animation intervals
        if (animationIntervalRef.current) {
          clearInterval(animationIntervalRef.current)
          animationIntervalRef.current = null
        }

        // Add base tile layer back if it was removed
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)

        // Add destination markers
        destinations.forEach((destination) => {
          L.marker(destination.coordinates as [number, number])
            .addTo(map)
            .bindPopup(destination.name)
        })

        // Add route if available
        if (route && route.startCoords && route.endCoords) {
          // Validate coordinates
          const startCoords = route.startCoords as [number, number]
          const endCoords = route.endCoords as [number, number]
          
          // Check if coordinates are valid numbers
          if (isNaN(startCoords[0]) || isNaN(startCoords[1]) || 
              isNaN(endCoords[0]) || isNaN(endCoords[1])) {
            console.error("Invalid coordinates:", route.startCoords, route.endCoords)
            return
          }
          
          // Start marker with custom icon
          const startIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #4CAF50; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
          
          L.marker(startCoords, { icon: startIcon })
            .addTo(map)
            .bindPopup(`Start: ${route.startPoint}`)

          // End marker with custom icon
          const endIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #F44336; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
          
          L.marker(endCoords, { icon: endIcon })
            .addTo(map)
            .bindPopup(`End: ${route.endPoint}`)

          // Route line with animation
          const routeLine = L.polyline([startCoords, endCoords], {
            color: "#2196F3",
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10'
          }).addTo(map)
          
          // Animate the dash array for a moving effect
          let offset = 0
          animationIntervalRef.current = setInterval(() => {
            offset = (offset + 1) % 20
            // Fix the type error by converting the number to a string
            routeLine.setStyle({ dashOffset: `-${offset}` })
          }, 100)

          // Fit map to show the route with padding
          map.fitBounds([startCoords, endCoords], {
            padding: [50, 50],
          })
          
          // Add a small delay to ensure the map has time to render
          setTimeout(() => {
            map.invalidateSize()
          }, 100)
        }
      } catch (error) {
        console.error("Error updating map:", error)
      }
    }

    updateMap()
  }, [map, destinations, route, isClient])

  if (!isClient) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 rounded-md">
        <p>Loading map...</p>
      </div>
    )
  }

  return <div id="map" className="h-[600px] w-full rounded-md overflow-hidden border border-gray-200 shadow-sm"></div>
}
