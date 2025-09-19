'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestPage() {
  const [destinations, setDestinations] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('destinations').select('*')
      if (!error && data) setDestinations(data)
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
