'use client'

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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 flex items-center justify-center">
        {/* "Loading..." -> "Ielādē..." */}
        <p className="text-gray-600 dark:text-gray-400">Ielādē...</p>
      </div>
    )
  }

  if (!isAdmin()) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      {/* "Admin Dashboard" -> "Administrēšanas panelis" */}
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Administrēšanas panelis</h1>
      <AdminDashboard />
    </div>
  )
}