'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Filter } from 'lucide-react'
import LikeButton from "@/components/like-button"

// Import destinations data
const destinations = [
  {
    id: "riga",
    name: "Old town, Riga",
    description:
      "Explore the charming cobblestone streets and colorful buildings of Riga's historic Old Town, a UNESCO World Heritage site featuring stunning architecture from various periods.",
    category: "city",
    region: "central",
  },
  {
    id: "sigulda",
    name: "Sigulda",
    description:
      'Known as the "Switzerland of Latvia," Sigulda offers breathtaking landscapes, medieval castles, and outdoor activities surrounded by the picturesque Gauja National Park.',
    category: "nature",
    region: "central",
  },
  {
    id: "jurmala",
    name: "Jūrmala",
    description:
      "Latvia's premier beach resort town features 33 km of white sand beaches along the Baltic Sea, charming wooden architecture, and a relaxing spa culture.",
    category: "beach",
    region: "western",
  },
  {
    id: "cesis",
    name: "Cēsis",
    description:
      "One of Latvia's most picturesque towns, Cēsis boasts a well-preserved medieval castle, charming old town, and beautiful surroundings perfect for history enthusiasts.",
    category: "city",
    region: "central",
  },
  {
    id: "kuldiga",
    name: "Kuldīga",
    description:
      "A picturesque town known for its red-tiled roofs, cobblestone streets, and Europe's widest waterfall, Ventas Rumba. The historic center is a well-preserved example of a traditional Latvian town.",
    category: "city",
    region: "western",
  },
  {
    id: "liepaja",
    name: "Liepāja",
    description:
      "A coastal city with beautiful beaches, a historic naval port, and a vibrant music scene. Known as 'The city where the wind is born,' Liepāja offers a mix of cultural heritage and seaside charm.",
    category: "city",
    region: "western",
  },
  {
    id: "rundale",
    name: "Rundāle Palace",
    description:
      "A magnificent baroque palace often called the 'Versailles of Latvia.' The palace features stunning architecture, lavish interiors, and beautiful French-style gardens.",
    category: "palace",
    region: "southern",
  },
  {
    id: "gauja",
    name: "Gauja National Park",
    description:
      "Latvia's largest and oldest national park, featuring diverse landscapes, medieval castles, sandstone cliffs, and extensive hiking and cycling trails through pristine nature.",
    category: "nature",
    region: "central",
  },
]

// Categories and regions for filtering
const categories = ["all", "city", "nature", "beach", "palace"]
const regions = ["all", "central", "western", "southern", "eastern"]

export default function DestinationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRegion, setSelectedRegion] = useState("all")

  // Filter destinations based on search term, category, and region
  const filteredDestinations = destinations.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         destination.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || destination.category === selectedCategory
    const matchesRegion = selectedRegion === "all" || destination.region === selectedRegion
    
    return matchesSearch && matchesCategory && matchesRegion
  })

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
              <div className="flex gap-4">
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
              Showing {filteredDestinations.length} of {destinations.length} destinations
            </p>
          </div>

          {/* Destinations grid */}
          {filteredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDestinations.map((destination) => (
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
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-200">
                        {destination.category}
                      </span>
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-200">
                        {destination.region}
                      </span>
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