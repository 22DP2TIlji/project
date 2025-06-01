"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Search, Clock, Navigation, Car, Footprints } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { Destination } from "@/lib/types"
import Link from "next/link"
import LikeButton from "@/components/like-button"

// Dynamically import the Map component with no SSR
const ItineraryMap = dynamic(() => import("@/components/itinerary-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 rounded-md">
      <p>Loading map...</p>
    </div>
  ),
})

// Define a type for popular destinations for clarity
interface PopularDestination {
  id: string;
  name: string;
  coordinates: [number, number]; // Explicitly a tuple
}

// Popular destinations with coordinates as tuples
const popularDestinations: PopularDestination[] = [
  { id: "riga", name: "Riga", coordinates: [56.9496, 24.1052] },
  { id: "jurmala", name: "Jūrmala", coordinates: [56.9715, 23.7408] },
  { id: "sigulda", name: "Sigulda", coordinates: [57.1537, 24.8598] },
  { id: "cesis", name: "Cēsis", coordinates: [57.3119, 25.2749] },
  { id: "kuldiga", name: "Kuldīga", coordinates: [56.9677, 21.9617] },
  { id: "liepaja", name: "Liepāja", coordinates: [56.5047, 21.0107] },
  { id: "daugavpils", name: "Daugavpils", coordinates: [55.8714, 26.5161] },
  { id: "ventspils", name: "Ventspils", coordinates: [57.3894, 21.5606] },
];

// Transportation modes with average speeds in km/h
const transportModes = [
  { id: "car", name: "Car", icon: Car, speed: 60 },
  { id: "walking", name: "Walking", icon: Footprints, speed: 5 },
]

export default function ItineraryPage() {
  const { user, isAuthenticated, removeSavedDestination } = useAuth()
  const [startPoint, setStartPoint] = useState("")
  const [endPoint, setEndPoint] = useState("")
  const [customStartPoint, setCustomStartPoint] = useState("")
  const [customEndPoint, setCustomEndPoint] = useState("")
  const [startAddress, setStartAddress] = useState("")
  const [endAddress, setEndAddress] = useState("")
  const [transportMode, setTransportMode] = useState("car")
  const [route, setRoute] = useState<any>(null)
  const [savedItineraries, setSavedItineraries] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodedStartCoords, setGeocodedStartCoords] = useState<[number, number] | null>(null)
  const [geocodedEndCoords, setGeocodedEndCoords] = useState<[number, number] | null>(null)
  const [likedDestinations, setLikedDestinations] = useState<Destination[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)

    // Load saved itineraries from localStorage
    try {
      const saved = localStorage.getItem("savedItineraries")
      if (saved) {
        setSavedItineraries(JSON.parse(saved))
      }
    } catch (error) {
      console.error("Error loading saved itineraries:", error)
    }

    // Fetch liked destinations directly from the API
    const fetchLikedDestinations = async () => {
      setIsLoading(true)
      if (isAuthenticated && user?.id) {
        try {
          const response = await fetch('/api/users/liked-destinations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
          })

          if (response.ok) {
            const data = await response.json()
            console.log('Fetched liked destinations:', data.likedDestinations)
            setLikedDestinations(data.likedDestinations || [])
          } else {
            console.error('Failed to fetch liked destinations:', response.statusText)
            setLikedDestinations([])
          }
        } catch (error) {
          console.error('Error fetching liked destinations:', error)
          setLikedDestinations([])
        } finally {
          setIsLoading(false)
        }
      } else {
        console.log('User not authenticated or user ID missing, clearing liked destinations')
        setLikedDestinations([])
        setIsLoading(false)
      }
    }

    fetchLikedDestinations()

    // Keep dark mode effect if needed
    if (typeof window !== 'undefined') {
      setDarkMode(document.documentElement.classList.contains('dark'))
    }
  }, [user?.id, isAuthenticated])

  // Find coordinates for selected destinations
  const getCoordinates = (pointId: string): [number, number] | null => {
    const destination = popularDestinations.find((dest) => dest.id === pointId)
    return destination?.coordinates || null
  }

  // Geocode address to coordinates
  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    if (!address) return null
    
    setIsGeocoding(true)
    console.log(`Attempting to geocode address: "${address}"`)
    try {
      // In a real app, you would use a geocoding service like OpenStreetMap Nominatim
      // For this example, we'll use a more sophisticated approach to simulate geocoding
      
      // First, check if the address contains a city name from our popular destinations
      const cityMatch = popularDestinations.find(dest => 
        address.toLowerCase().includes(dest.name.toLowerCase())
      )
      
      if (cityMatch) {
        // If the address contains a known city, use its coordinates with a small random offset
        // to simulate a specific address within that city
        const lat = cityMatch.coordinates[0] + (Math.random() * 0.02 - 0.01)
        const lng = cityMatch.coordinates[1] + (Math.random() * 0.02 - 0.01)
        const coords: [number, number] = [lat, lng]
        console.log(`Geocoded address "${address}" to coordinates near ${cityMatch.name}: [${coords[0]}, ${coords[1]}]`)
        return coords
      }
      
      // If no city match, try to extract a street name and number
      const streetMatch = address.match(/(\d+)\s+([A-Za-z\s]+)/)
      if (streetMatch) {
        // If we found a street number and name, use a more deterministic approach
        const streetNumber = parseInt(streetMatch[1])
        const streetName = streetMatch[2].trim().toLowerCase()
        
        // Use the street number to generate a deterministic offset
        // This ensures the same address always gets the same coordinates
        const latOffset = (streetNumber % 100) / 1000
        const lngOffset = ((streetNumber * 7) % 100) / 1000
        
        // Use Riga as the base city if no specific city is mentioned
        const baseCity = popularDestinations.find(dest => dest.id === "riga") || popularDestinations[0]
        const lat = baseCity.coordinates[0] + latOffset
        const lng = baseCity.coordinates[1] + lngOffset
        
        const coords: [number, number] = [lat, lng]
        console.log(`Geocoded address "${address}" to coordinates: [${coords[0]}, ${coords[1]}]`)
        return coords
      }
      
      // If we couldn't extract any useful information, use a more structured approach
      // Generate coordinates based on the address string itself
      const addressHash = address.split('').reduce((hash, char) => {
        return char.charCodeAt(0) + ((hash << 5) - hash)
      }, 0)
      
      // Use the hash to generate deterministic coordinates within Latvia
      // Latvia is roughly between 55.7-58.1°N and 20.5-28.2°E
      const lat = 56.5 + (Math.abs(addressHash) % 15) / 10
      const lng = 24.0 + (Math.abs(addressHash * 7) % 42) / 10
      
      const coords: [number, number] = [lat, lng]
      console.log(`Geocoded address "${address}" to coordinates: [${coords[0]}, ${coords[1]}]`)
      return coords
    } catch (error) {
      console.error("Error geocoding address:", error)
      return null
    } finally {
      setIsGeocoding(false)
    }
  }

  // Calculate a route (in a real app, you'd use a routing API)
  const calculateRoute = async () => {
    console.log('Calculate route called.')
    try {
      let startCoords: [number, number] | null = null
      let endCoords: [number, number] | null = null

      // Get coordinates from selected popular destinations
      if (startPoint !== "custom" && startPoint !== "address") {
        startCoords = getCoordinates(startPoint)
      }
      if (endPoint !== "custom" && endPoint !== "address") {
        endCoords = getCoordinates(endPoint)
      }

      // If using custom points, parse them
      if (startPoint === "custom" && customStartPoint) {
        const [lat, lng] = customStartPoint.split(",").map((coord) => Number.parseFloat(coord.trim()))
        if (!isNaN(lat) && !isNaN(lng)) {
          startCoords = [lat, lng] as [number, number]
        }
      }

      if (endPoint === "custom" && customEndPoint) {
        const [lat, lng] = customEndPoint.split(",").map((coord) => Number.parseFloat(coord.trim()))
        if (!isNaN(lat) && !isNaN(lng)) {
          endCoords = [lat, lng] as [number, number]
        }
      }

      // If using address input, geocode the addresses
      if (startPoint === "address" && startAddress) {
        startCoords = await geocodeAddress(startAddress)
      }

      if (endPoint === "address" && endAddress) {
        endCoords = await geocodeAddress(endAddress)
      }

      console.log('Resolved start coordinates:', startCoords)
      console.log('Resolved end coordinates:', endCoords)

      if (!startCoords || !endCoords) {
        alert("Please select valid start and end points")
        console.log('Start or end coordinates missing.', { startCoords, endCoords })
        return
      }

      // Store geocoded coordinates if successful for potential map use
      if (startPoint === "address") setGeocodedStartCoords(startCoords)
      if (endPoint === "address") setGeocodedEndCoords(endCoords)

      // Get the selected transport mode
      const selectedMode = transportModes.find(mode => mode.id === transportMode)
      const speed = selectedMode ? selectedMode.speed : 60 // Default to car speed

      // Calculate a straight line route (simplified)
      const distance = calculateDistance(startCoords[0], startCoords[1], endCoords[0], endCoords[1])
      const timeInHours = distance / speed
      const timeInMinutes = Math.round(timeInHours * 60)

      const newRoute = {
        startPoint:
          startPoint === "custom" 
            ? "Custom location" 
            : startPoint === "address" 
              ? startAddress 
              : popularDestinations.find((d) => d.id === startPoint)?.name,
        endPoint: 
          endPoint === "custom" 
            ? "Custom location" 
            : endPoint === "address" 
              ? endAddress 
              : popularDestinations.find((d) => d.id === endPoint)?.name,
        startCoords: startCoords,
        endCoords: endCoords,
        distance: distance,
        time: timeInHours,
        timeInMinutes: timeInMinutes,
        transportMode: transportMode,
      }

      setRoute(newRoute)
      console.log('Route calculated:', newRoute)
    } catch (error) {
      console.error("Error calculating route:", error)
      alert("An error occurred while calculating the route. Please try again.")
    }
  }

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180)
  }

  // Save the current itinerary
  const saveItinerary = () => {
    try {
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
    } catch (error) {
      console.error("Error saving itinerary:", error)
      alert("An error occurred while saving the itinerary. Please try again.")
    }
  }

  // Delete a saved itinerary
  const deleteItinerary = (id: string) => {
    try {
      const updatedItineraries = savedItineraries.filter((itinerary) => itinerary.id !== id)
      setSavedItineraries(updatedItineraries)
      localStorage.setItem("savedItineraries", JSON.stringify(updatedItineraries))
    } catch (error) {
      console.error("Error deleting itinerary:", error)
      alert("An error occurred while deleting the itinerary. Please try again.")
    }
  }

  // Format time for display
  const formatTime = (hours: number) => {
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    
    if (wholeHours === 0) {
      return `${minutes} minutes`
    } else if (minutes === 0) {
      return `${wholeHours} ${wholeHours === 1 ? 'hour' : 'hours'}`
    } else {
      return `${wholeHours} ${wholeHours === 1 ? 'hour' : 'hours'} ${minutes} minutes`
    }
  }

  return (
    <>
      <section className="relative h-[40vh] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200 dark:bg-gray-700"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 dark:text-white">Plan Your Itinerary</h1>
          <p className="mt-4 text-xl text-gray-700 dark:text-gray-200">Create your perfect route through Latvia</p>
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
                    <option value="custom">Custom coordinates</option>
                    <option value="address">Enter address</option>
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
                      placeholder="56.9496, 24.1052"
                      className="w-full p-3 border border-gray-300 rounded-md"
                    />
                  </div>
                )}

                {startPoint === "address" && (
                  <div className="mb-4">
                    <label htmlFor="startAddress" className="block mb-2 text-sm font-medium">
                      Starting Address
                    </label>
                    <input
                      type="text"
                      id="startAddress"
                      value={startAddress}
                      onChange={(e) => setStartAddress(e.target.value)}
                      placeholder="Enter starting address"
                      className="w-full p-3 border border-gray-300 rounded-md"
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="endPoint" className="block mb-2 text-sm font-medium">
                    End Point
                  </label>
                  <select
                    id="endPoint"
                    value={endPoint}
                    onChange={(e) => setEndPoint(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md"
                  >
                    <option value="">Select end point</option>
                    {popularDestinations.map((dest) => (
                      <option key={`end-${dest.id}`} value={dest.id}>
                        {dest.name}
                      </option>
                    ))}
                    <option value="custom">Custom coordinates</option>
                    <option value="address">Enter address</option>
                  </select>
                </div>

                {endPoint === "custom" && (
                  <div className="mb-4">
                    <label htmlFor="customEndPoint" className="block mb-2 text-sm font-medium">
                      Custom End Point (lat, lng)
                    </label>
                    <input
                      type="text"
                      id="customEndPoint"
                      value={customEndPoint}
                      onChange={(e) => setCustomEndPoint(e.target.value)}
                      placeholder="56.9715, 23.7408"
                      className="w-full p-3 border border-gray-300 rounded-md"
                    />
                  </div>
                )}

                {endPoint === "address" && (
                  <div className="mb-4">
                    <label htmlFor="endAddress" className="block mb-2 text-sm font-medium">
                      End Address
                    </label>
                    <input
                      type="text"
                      id="endAddress"
                      value={endAddress}
                      onChange={(e) => setEndAddress(e.target.value)}
                      placeholder="Enter end address"
                      className="w-full p-3 border border-gray-300 rounded-md"
                    />
                  </div>
                )}

                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium">
                    Transportation Mode
                  </label>
                  <div className="flex space-x-4">
                    {transportModes.map((mode) => {
                      const Icon = mode.icon
                      return (
                        <label 
                          key={mode.id} 
                          className={`flex items-center space-x-2 p-3 border rounded-md cursor-pointer ${
                            transportMode === mode.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="transportMode"
                            value={mode.id}
                            checked={transportMode === mode.id}
                            onChange={(e) => setTransportMode(e.target.value)}
                            className="sr-only"
                          />
                          <Icon className={`w-5 h-5 ${transportMode === mode.id ? 'text-blue-500' : 'text-gray-500'}`} />
                          <span className={transportMode === mode.id ? 'text-blue-500' : 'text-gray-700'}>
                            {mode.name}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <button
                  onClick={calculateRoute}
                  className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={isGeocoding}
                >
                  {isGeocoding ? "Processing..." : "Calculate Route"}
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              {route ? (
                <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 mb-8">
                  <h2 className="text-2xl font-light mb-4">Route Details</h2>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-md">
                      <h3 className="text-lg font-medium mb-2">From</h3>
                      <p>{route.startPoint}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-md">
                      <h3 className="text-lg font-medium mb-2">To</h3>
                      <p>{route.endPoint}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-md text-center">
                      <Navigation className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                      <h3 className="text-lg font-medium">Distance</h3>
                      <p>{route.distance} km</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-md text-center">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                      <h3 className="text-lg font-medium">Time</h3>
                      <p>{formatTime(route.time)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-md text-center">
                      {transportMode === "car" ? (
                        <Car className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                      ) : (
                        <Footprints className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                      )}
                      <h3 className="text-lg font-medium">Mode</h3>
                      <p className="capitalize">{route.transportMode}</p>
                    </div>
                  </div>
                  <button
                    onClick={saveItinerary}
                    className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Save Itinerary
                  </button>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 mb-8 text-center">
                  <p className="text-gray-500">Calculate a route to see details here</p>
                </div>
              )}

              <ItineraryMap route={route} destinations={popularDestinations} />
            </div>
          </div>

          {savedItineraries.length > 0 && (
            <div className="mt-16">
              <h2 className="text-3xl font-light mb-6">Saved Itineraries</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedItineraries.map((itinerary) => (
                  <div key={itinerary.id} className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-medium">
                        {itinerary.startPoint} → {itinerary.endPoint}
                      </h3>
                      <button
                        onClick={() => deleteItinerary(itinerary.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Distance</p>
                        <p className="font-medium">{itinerary.distance} km</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-medium">{formatTime(itinerary.time)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Mode</p>
                        <p className="font-medium capitalize">{itinerary.transportMode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">
                          {new Date(itinerary.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setRoute(itinerary)}
                      className="w-full py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      View on Map
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light mb-4 text-center text-gray-900 dark:text-white">Your Favorite Destinations</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">Discover your saved places to visit</p>

          {isLoading ? (
             <div className="text-center text-gray-600 dark:text-gray-300">Loading favorite destinations...</div>
          ) : isAuthenticated && user && likedDestinations.length > 0 ? (
             // Display liked destinations if authenticated and user has liked any
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {likedDestinations.map((destination) => (
                <div
                  key={destination.id}
                  className="group border border-gray-200 dark:border-gray-700 rounded-md p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                >
                  <div className="relative h-64 mb-4 overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${destination.image || '/placeholder-image.jpg'})` }}></div>
                  </div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-medium text-gray-900 dark:text-white">{destination.name}</h3>
                    <LikeButton destinationId={destination.id as string} destinationName={destination.name} initialLiked={true} />
                  </div>
                  <p className="mt-2 text-gray-600 dark:text-gray-200">{destination.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex gap-2">
                      {destination.category && (
                        <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-200">
                          {destination.category}
                        </span>
                      )}
                      {destination.region && (
                        <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-200">
                          {destination.region}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/destination/${destination.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : isAuthenticated && user && likedDestinations.length === 0 ? (
              // Message if authenticated but no liked destinations
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300">
                You haven\'t liked any destinations yet. Visit our{" "}
                <Link href="/destinations" className="text-gray-900 dark:text-white hover:underline">
                  Destinations
                </Link>{" "}
                page to discover amazing places in Latvia!
              </p>
            </div>
           ) : (
              // Message if not authenticated
            <div className="text-center">
               <p className="text-gray-600 dark:text-gray-300">
                 Please{" "}
                 <Link href="/login" className="text-gray-900 dark:text-white hover:underline">
                   log in
                 </Link>{" "}
                 to see your favorite destinations.
               </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
