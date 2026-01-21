'use client'

import { useEffect, useState } from 'react'

export default function TestPage() {
  const [destinations, setDestinations] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/destinations')
        const data = await res.json()
        if (data.success) setDestinations(data.destinations || [])
      } catch (error) {
        console.error('Error loading destinations:', error)
      }
    }
    load()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Destinations</h1>
      <ul>
        {destinations.map((d) => (
          <li key={d.id}>{d.name} – {d.description}</li>
        ))}
      </ul>
    </div>
  )
}
