"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function WeatherRedirectPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/explore#weather")
  }, [router])

  return (
    <div className="page-shell">
      <div className="redirect-card">
        <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-sky-100" />
        <p>Notiek pāradresācija...</p>
      </div>
    </div>
  )
}