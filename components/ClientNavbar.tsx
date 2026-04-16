'use client'
import { useState } from 'react'
import Link from 'next/link'

export function ClientNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="p-4 bg-gray-100">
      <button
        className="px-2 py-1 border rounded"
        onClick={() => setOpen(!open)}
      >
        {open ? 'Aizvērt izvēlni' : 'Atvērt izvēlni'}
      </button>

      {open && (
        <ul className="mt-2 space-y-1">
          <li><Link href="/destinations">Galamērķi</Link></li>
          <li><Link href="/itinerary">Plānot ceļojumu</Link></li>
          <li><Link href="/explore">Izpētīt</Link></li>
          <li><Link href="/contact">Kontakti</Link></li>
        </ul>
      )}
    </nav>
  )
}