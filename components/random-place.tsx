"use client"

import { useState } from "react"
import Link from "next/link"
import { getCategoryLabel } from "@/lib/category-utils"
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
    <div className="h-full rounded-[1.25rem] border border-slate-200/80 bg-white/90 p-5 shadow-lg shadow-slate-900/5">      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-900">Nejauša vieta</h3>
         <button
          type="button"
          onClick={fetchRandom}
          disabled={loading}
          className="rounded-full bg-sky-50 p-2 text-sky-700 transition hover:bg-sky-100 disabled:opacity-50"          title="Saņemt nejaušu vietu"
        >
          <Shuffle className="h-4 w-4" />
        </button>
      </div>
      {loading && <p className="text-sm text-slate-500">Ielādē...</p>}      {!loading && place && (
        <div>
          <Link
            href={`/destination/${place.id}`}
            className="font-semibold text-sky-700 hover:underline"          >
            {place.name}
          </Link>
          {place.city && (
            <span className="ml-1 text-sm text-slate-500">({place.city})</span>          )}
          {place.description && (
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">              {place.description}
            </p>
          )}
          {place.category && (
            <span className="mt-3 inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">              {getCategoryLabel(place.category)}
            </span>
          )}
        </div>
      )}
      {!loading && !place && (
        <p className="text-sm text-slate-500">Spiediet pogu, lai atklātu</p>      )}
    </div>
  )
}