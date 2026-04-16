"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function EventsRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/explore#events")
  }, [router])
  return (
    <p className="p-8 text-center text-gray-600 dark:text-gray-300">Pāradresācija…</p>
  )
}