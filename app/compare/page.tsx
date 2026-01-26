"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, MapPin, Star, Calendar, X, Plus } from "lucide-react"

export default function ComparePage() {
  const [selectedDestinations, setSelectedDestinations] = useState<any[]>([])
  const [allDestinations, setAllDestinations] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredDestinations, setFilteredDestinations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/destinations")
      .then((res) => res.json())
      .then((data) => {
        setAllDestinations(data.destinations || [])
        setFilteredDestinations(data.destinations || [])
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = allDestinations.filter(
        (d) =>
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredDestinations(filtered)
    } else {
      setFilteredDestinations(allDestinations)
    }
  }, [searchTerm, allDestinations])

  const addDestination = (destination: any) => {
    if (selectedDestinations.length >= 3) {
      alert("You can compare up to 3 destinations at once")
      return
    }
    if (selectedDestinations.find((d) => d.id === destination.id)) {
      alert("This destination is already added")
      return
    }
    setSelectedDestinations([...selectedDestinations, destination])
  }

  const removeDestination = (id: number) => {
    setSelectedDestinations(selectedDestinations.filter((d) => d.id !== id))
  }

  return (
    <>
      <section className="relative h-[40vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light">Compare Destinations</h1>
          <p className="mt-4 text-xl">Compare up to 3 destinations side by side</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {selectedDestinations.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-6 mb-8">
              <p className="text-gray-700">
                Select up to 3 destinations to compare. Use the search below to find destinations.
              </p>
            </div>
          ) : (
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedDestinations.map((dest) => (
                  <div key={dest.id} className="border border-gray-200 rounded-md p-4 bg-white relative">
                    <button
                      onClick={() => removeDestination(dest.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <h3 className="text-xl font-semibold mb-2">{dest.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{dest.description}</p>
                    {dest.category && (
                      <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-xs rounded">
                        {dest.category}
                      </span>
                    )}
                    {dest.region && (
                      <span className="inline-block mt-2 ml-2 px-2 py-1 bg-gray-100 text-xs rounded">
                        {dest.region}
                      </span>
                    )}
                    {dest.latitude && dest.longitude && (
                      <div className="mt-2 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {Number(dest.latitude).toFixed(4)}, {Number(dest.longitude).toFixed(4)}
                      </div>
                    )}
                    <Link
                      href={`/destination/${dest.id}`}
                      className="mt-3 inline-block text-sm text-blue-600 hover:underline"
                    >
                      View details →
                    </Link>
                  </div>
                ))}
                {selectedDestinations.length < 3 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4 flex items-center justify-center min-h-[200px]">
                    <div className="text-center">
                      <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Add destination</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-md p-6">
            <h2 className="text-2xl font-light mb-4">Search Destinations</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {loading ? (
              <p className="text-gray-600">Loading destinations...</p>
            ) : filteredDestinations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
                {filteredDestinations
                  .filter((d) => !selectedDestinations.find((sd) => sd.id === d.id))
                  .map((dest) => (
                    <div
                      key={dest.id}
                      className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => addDestination(dest)}
                    >
                      <h4 className="font-semibold">{dest.name}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{dest.description}</p>
                      <button className="mt-2 text-sm text-blue-600 hover:underline">
                        Add to compare
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-600">No destinations found</p>
            )}
          </div>

          {selectedDestinations.length > 0 && (
            <div className="mt-8 bg-white border border-gray-200 rounded-md p-6">
              <h2 className="text-2xl font-light mb-4">Comparison Table</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Feature</th>
                      {selectedDestinations.map((dest) => (
                        <th key={dest.id} className="text-left p-2">
                          {dest.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Name</td>
                      {selectedDestinations.map((dest) => (
                        <td key={dest.id} className="p-2">
                          {dest.name}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Description</td>
                      {selectedDestinations.map((dest) => (
                        <td key={dest.id} className="p-2 text-sm">
                          {dest.description || "N/A"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Category</td>
                      {selectedDestinations.map((dest) => (
                        <td key={dest.id} className="p-2">
                          {dest.category || "N/A"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Region</td>
                      {selectedDestinations.map((dest) => (
                        <td key={dest.id} className="p-2">
                          {dest.region || "N/A"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Location</td>
                      {selectedDestinations.map((dest) => (
                        <td key={dest.id} className="p-2 text-sm">
                          {dest.latitude && dest.longitude
                            ? `${Number(dest.latitude).toFixed(4)}, ${Number(dest.longitude).toFixed(4)}`
                            : "N/A"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Actions</td>
                      {selectedDestinations.map((dest) => (
                        <td key={dest.id} className="p-2">
                          <Link
                            href={`/destination/${dest.id}`}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View details
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
