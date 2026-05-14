"use client"

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminDashboard from '@/components/admin-dashboard'

export default function AdminPage() {
  const { isAdmin, isLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    if (isLoading) return
    if (!isAdmin()) {
      router.push('/')
    } else {
      // Fetch users for admin
      fetch('/api/admin/users')
        .then(res => res.json())
        .then(data => setUsers(data.users || []))
    }
  }, [isAdmin, isLoading, router])

  if (isLoading) {
    return (
      <div className="page-shell flex items-center justify-center">
        {/* "Loading..." -> "Ielādē..." */}
        <p className="text-gray-600 dark:text-gray-400">Ielādē...</p>
      </div>
    )
  }

  if (!isAdmin()) {
    return null
  }

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="page-hero mb-8">
          <span className="eyebrow">Administrēšana</span>
          <h1 className="text-3xl font-black text-slate-450 md:text-5xl">Administrēšanas panelis</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Pārvaldiet lietotājus, galamērķus un atsauksmes vienotā profesionālā darba vidē.
          </p>
        </div>
        <AdminDashboard />
      </div>
    </div>
  )
}
