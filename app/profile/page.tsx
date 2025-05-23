'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!user) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-light text-gray-900 dark:text-white">Account Profile</h2>
        <div className="mb-4">
          <span className="block text-sm text-gray-500 dark:text-gray-400">Name:</span>
          <span className="text-lg font-medium text-gray-900 dark:text-white">{user.name}</span>
        </div>
        <div className="mb-4">
          <span className="block text-sm text-gray-500 dark:text-gray-400">Email:</span>
          <span className="text-lg font-medium text-gray-900 dark:text-white">{user.email}</span>
        </div>
        <div className="mb-6">
          <span className="block text-sm text-gray-500 dark:text-gray-400">Role:</span>
          <span className="text-lg font-medium text-gray-900 dark:text-white">{user.role}</span>
        </div>
        <button
          onClick={logout}
          className="w-full rounded-md bg-red-600 py-3 px-4 text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  )
} 