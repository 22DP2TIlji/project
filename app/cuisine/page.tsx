"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CuisineRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Pāradresē uz virtuves sadaļu izpētes lapā
    router.replace("/explore#cuisine")
  }, [router])

  return (
    <p className="p-8 text-center text-gray-600 dark:text-gray-300 italic">
      Notiek pāradresācija…
    </p>
  )
}