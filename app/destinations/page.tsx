'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Filter, Navigation } from 'lucide-react'
import LikeButton from "@/components/like-button"

const categories = ["visi", "pilseta", "daba", "pludmale", "pils"]
const regions = ["visi", "centrāls", "rietumu", "dienvidu", "austrumu"]

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [loading, setLoading] = useState(true)
  const [useLocationFilter, setUseLocationFilter] = useState(false)
  const [filterLat, setFilterLat] = useState("")
  const [filterLng, setFilterLng] = useState("")
  const [filterRadius, setFilterRadius] = useState("50")

  useEffect(() => {
    setLoading(true);
    const queryParams = new URLSearchParams();
    if (searchTerm) {
      queryParams.append('meklēt', searchTerm);
    }
    if (selectedCategory !== 'visi') {
      queryParams.append('categorija', selectedCategory);
    }
    if (selectedRegion !== 'visi') {
      queryParams.append('reģions', selectedRegion);
    }
    
    // Фильтр по расстоянию
    if (useLocationFilter && filterLat && filterLng && filterRadius) {
      queryParams.append('lat', filterLat);
      queryParams.append('lng', filterLng);
      queryParams.append('radius', filterRadius);
    }

    const apiUrl = `/api/destinations?${queryParams.toString()}`;
    console.log('Gūstot galamērķus no:', apiUrl);

    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        console.log('Saņemtie galamērķu dati:', data);
        setDestinations(data.destinations || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error('Kļūda, iegūstot galamērķus:', error);
        setLoading(false);
        setDestinations([]);
      })
  }, [searchTerm, selectedCategory, selectedRegion, useLocationFilter, filterLat, filterLng, filterRadius])

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFilterLat(position.coords.latitude.toString())
          setFilterLng(position.coords.longitude.toString())
          setUseLocationFilter(true)
        },
        (error) => {
          alert('Nav iespējams noteikt jūsu atrašanās vietu. Lūdzu, ievadiet koordinātas manuāli.')
          console.error('Ģeolokācijas kļūda:', error)
        }
      )
    } else {
      alert('Jūsu pārlūkprogramma neatbalsta ģeolokāciju.')
    }
  }

  const displayedDestinations = destinations;

  return (
    <>
      <section className="relative h-[40vh] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200 dark:bg-gray-700">{/* Placeholder for background image */}</div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 dark:text-white">Galamērķi</h1>
          <p className="mt-4 text-xl text-gray-700 dark:text-gray-200">Atklājiet labākās vietas, kuras apmeklēt Latvijā</p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          {/* Search and filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Meklēt galamērķus..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <select
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category} className="bg-white dark:bg-gray-800">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <select
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  {regions.map(region => (
                    <option key={region} value={region} className="bg-white dark:bg-gray-800">
                      {region.charAt(0).toUpperCase() + region.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Distance filter */}
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="useLocationFilter"
                  checked={useLocationFilter}
                  onChange={(e) => setUseLocationFilter(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="useLocationFilter" className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Filtrēt pēc attāluma no atrašanās vietas
                </label>
              </div>
              {useLocationFilter && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={filterLat}
                    onChange={(e) => setFilterLat(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={filterLng}
                    onChange={(e) => setFilterLng(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                  <input
                    type="number"
                    min="10"
                    max="500"
                    placeholder="Radius (km)"
                    value={filterRadius}
                    onChange={(e) => setFilterRadius(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                  <button
                    onClick={handleGetCurrentLocation}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Navigation className="h-4 w-4" />
                    Izmantot manu atrašanās vietu
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.filter(cat => cat !== "all").map(category => (
                <button
                  key={category}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300">
              {loading ? "Ielādes skaits..." : `Rāda  ${displayedDestinations.length} galamērķus`}
              {useLocationFilter && filterLat && filterLng && (
                <span className="ml-2 text-sm">
                  {filterRadius} km attālumā no ({filterLat}, {filterLng})
                </span>
              )}
            </p>
          </div>

          {/* Destinations grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-300">Ielādē galamērķus...</p>
            </div>
          ) : displayedDestinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedDestinations.map((destination) => (
                <div
                  key={destination.id}
                  className="group border border-gray-200 dark:border-gray-700 rounded-md p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                >
                  <div className="relative h-64 mb-4 overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700">
                    {destination.image_url && (
                      <img
                        src={destination.image_url}
                        alt={destination.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-medium text-gray-900 dark:text-white">{destination.name}</h3>
                    <LikeButton destinationId={destination.id} destinationName={destination.name} />
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
                      Skatīt detaļas
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-300">
                Nav atrastas galamērķis, kas atbilst jūsu kritērijiem. Mēģiniet pielāgot filtrus.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
