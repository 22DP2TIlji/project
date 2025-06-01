'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Filter } from 'lucide-react'
import LikeButton from "@/components/like-button"

const categories = ["all", "city", "nature", "beach", "palace"]
const regions = ["all", "central", "western", "southern", "eastern"]

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true);
    const queryParams = new URLSearchParams();
    if (searchTerm) {
      queryParams.append('search', searchTerm);
    }
    if (selectedCategory !== 'all') {
      queryParams.append('category', selectedCategory);
    }
    if (selectedRegion !== 'all') {
      queryParams.append('region', selectedRegion);
    }

    const apiUrl = `/api/destinations?${queryParams.toString()}`;
    console.log('Fetching destinations from:', apiUrl);

    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        console.log('Received destinations data:', data);
        setDestinations(data.destinations || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching destinations:', error);
        setLoading(false);
        setDestinations([]);
      })
  }, [searchTerm, selectedCategory, selectedRegion])

  const displayedDestinations = destinations;

  return (
    <>
      <section className="relative h-[40vh] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200 dark:bg-gray-700">{/* Placeholder for background image */}</div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 dark:text-white">Destinations</h1>
          <p className="mt-4 text-xl text-gray-700 dark:text-gray-200">Discover the best places to visit in Latvia</p>
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
                  placeholder="Search destinations..."
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
              {loading ? "Loading count..." : `Showing ${displayedDestinations.length} destinations`}
            </p>
          </div>

          {/* Destinations grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-300">Loading destinations...</p>
            </div>
          ) : displayedDestinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedDestinations.map((destination) => (
                <div
                  key={destination.id}
                  className="group border border-gray-200 dark:border-gray-700 rounded-md p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                >
                  <div className="relative h-64 mb-4 overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700">
                    {/* Placeholder for image */}
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
                      View details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-300">
                No destinations found matching your criteria. Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
} 