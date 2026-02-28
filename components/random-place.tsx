"use client"

import { useState } from "react"
import Link from "next/link"
import { Shuffle } from "lucide-react"

type Place = {
  id: number
  name: string
  city: string | null
  description: string | null
  category: string | null
}

export default function RandomPlace() {
  const [place, setPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchRandom = async () => {
    setLoading(true)
    setPlace(null)
    try {
      const res = await fetch("/api/random-place")
      const data = await res.json()
      if (data.success && data.place) {
        setPlace(data.place)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded-md border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-800">Random place</h3>
        <button
          type="button"
          onClick={fetchRandom}
          disabled={loading}
          className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          title="Get random place"
        >
          <Shuffle className="h-4 w-4" />
        </button>
      </div>
      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      {!loading && place && (
        <div>
          <Link
            href={`/destination/${place.id}`}
            className="text-blue-600 hover:underline font-medium"
          >
            {place.name}
          </Link>
          {place.city && (
            <span className="text-gray-500 text-sm ml-1">({place.city})</span>
          )}
          {place.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {place.description}
            </p>
          )}
          {place.category && (
            <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-100 rounded">
              {place.category}
            </span>
          )}
        </div>
      )}
      {!loading && !place && (
        <p className="text-sm text-gray-500">Click shuffle to discover</p>
      )}
    </div>
  )
}
