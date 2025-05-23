'use client'

import AdminDashboard from '@/components/admin-dashboard'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/')
    }
  }, [isAdmin, router])

  if (!isAdmin()) {
    return null
  }

  return <AdminDashboard />
} 