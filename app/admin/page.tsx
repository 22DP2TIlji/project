'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminDashboard from '@/components/admin-dashboard'

export default function AdminPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/')
    } else {
      // Fetch users for admin
      fetch('/api/admin/users')
        .then(res => res.json())
        .then(data => setUsers(data.users || []))
    }
  }, [isAdmin, router])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Administratora paneļis</h1>
      <AdminDashboard />
    </div>
  )
} 