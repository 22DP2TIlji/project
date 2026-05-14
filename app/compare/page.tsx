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
      alert("Vienlaicīgi varat salīdzināt līdz 3 galamērķiem")
      return
    }
    if (selectedDestinations.find((d) => d.id === destination.id)) {
      alert("Šis galamērķis jau ir pievienots.")
      return
    }
    setSelectedDestinations([...selectedDestinations, destination])
  }

  const removeDestination = (id: number) => {
    setSelectedDestinations(selectedDestinations.filter((d) => d.id !== id))
  }

  return (
    <>
      <section className="travel-hero">
        <div className="travel-hero-glow"></div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <h1 className="travel-hero-title">Salīdzināt galamērķus</h1>
          <p className="mt-4 text-xl text-gray-700">Salīdziniet līdz 3 galamērķiem vienuviet</p>
        </div>
      </section>

      <section className="travel-section">
        <div className="container mx-auto px-4">
          {selectedDestinations.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-6 mb-8 text-center">
              <p className="text-gray-700">
                Izvēlieties līdz 3 galamērķiem, lai tos salīdzinātu. Izmantojiet meklēšanu zemāk, lai atrastu vietas.
              </p>
            </div>
          ) : (
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedDestinations.map((dest) => (
                  <div key={dest.id} className="relative rounded-xl border border-slate-200 bg-white p-6">
                    <button
                      onClick={() => removeDestination(dest.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Noņemt"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{dest.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{dest.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {dest.category && (
                        <span className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-600">
                          {dest.category}
                        </span>
                      )}
                      {dest.region && (
                        <span className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-600">
                          {dest.region}
                        </span>
                      )}
                    </div>
                    {dest.latitude && dest.longitude && (
                      <div className="mt-3 text-xs text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {Number(dest.latitude).toFixed(4)}, {Number(dest.longitude).toFixed(4)}
                      </div>
                    )}
                    <Link
                      href={`/destination/${dest.id}`}
                      className="mt-4 inline-block text-sm text-blue-600 hover:underline font-medium"
                    >
                      Skatīt informāciju
                    </Link>
                  </div>
                ))}
                {selectedDestinations.length < 3 && (
                  <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
                    <div className="text-center">
                      <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Pievienot vēl vienu</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-7">
            <h2 className="text-2xl font-light mb-4 text-gray-900">Meklēt galamērķus</h2>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Ierakstiet nosaukumu vai aprakstu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {loading ? (
              <p className="text-gray-600 italic">Ielādē galamērķus...</p>
            ) : filteredDestinations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {filteredDestinations
                  .filter((d) => !selectedDestinations.find((sd) => sd.id === d.id))
                  .map((dest) => (
                    <div
                      key={dest.id}
                      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-sky-200 hover:bg-sky-50"
                      onClick={() => addDestination(dest)}
                    >
                      <h4 className="font-semibold text-gray-900">{dest.name}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{dest.description}</p>
                      <button className="mt-3 text-sm text-blue-600 flex items-center gap-1 font-medium hover:text-blue-700">
                        <Plus className="h-4 w-4" /> Pievienot salīdzināšanai
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-600">Netika atrasts neviens galamērķis</p>
            )}
          </div>

          {selectedDestinations.length > 0 && (
            <div className="mt-12 rounded-xl border border-slate-200 bg-white p-7">
              <h2 className="mb-5 text-2xl font-medium text-slate-950">Salīdzināšanas tabula</h2>
              <div className="overflow-x-auto">
                <table className="compare-table">
                  
                  <tbody className="">
                    <tr>
                      <td className="compare-row-label">Nosaukums</td>
                      {selectedDestinations.map((dest) => (
                        <td key={dest.id} className="compare-cell font-medium text-slate-950">
                          {dest.name}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="compare-row-label">Apraksts</td>
                      {selectedDestinations.map((dest) => (
                        <td key={dest.id} className="compare-cell text-sm leading-relaxed text-slate-600">
                          {dest.description || "Nav pieejams"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="compare-row-label">Kategorija</td>
                      {selectedDestinations.map((dest) => (
                        <td key={dest.id} className="compare-cell text-slate-900">
                          {dest.category || "Nav pieejama"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="compare-row-label">Reģions</td>
                      {selectedDestinations.map((dest) => (
                        <td key={dest.id} className="compare-cell text-slate-900">
                          {dest.region || "Nav pieejams"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="compare-row-label">Atrašanās vieta</td>
                      {selectedDestinations.map((dest) => (
                        <td key={dest.id} className="compare-cell text-sm text-slate-500">
                          {dest.latitude && dest.longitude
                            ? `${Number(dest.latitude).toFixed(4)}, ${Number(dest.longitude).toFixed(4)}`
                            : "Nav norādīta"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="compare-row-label">Darbības</td>
                      {selectedDestinations.map((dest) => (
                        <td key={dest.id} className="compare-cell">
                          <Link
                            href={`/destination/${dest.id}`}
                            className="text-sm font-medium text-sky-700 hover:underline"
                          >
                            Skatīt vairāk
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