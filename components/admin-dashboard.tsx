'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  totalDestinations: number;
  totalItineraries: number;
}

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalDestinations: 0,
    totalItineraries: 0
  })
  const [users, setUsers] = useState<any[]>([])
  const [destinations, setDestinations] = useState<any[]>([])

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/')
      return
    }

    // Load admin data
    const loadAdminData = () => {
      try {
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const destinations = JSON.parse(localStorage.getItem('destinations') || '[]')
        
        setUsers(users)
        setDestinations(destinations)
        
        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((u: any) => u.lastLogin).length,
          totalDestinations: destinations.length,
          totalItineraries: users.reduce((acc: number, user: any) => 
            acc + (user.savedItineraries?.length || 0), 0)
        })
      } catch (error) {
        console.error('Error loading admin data:', error)
      }
    }

    loadAdminData()
  }, [isAdmin, router])

  if (!isAdmin()) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-light mb-8 text-gray-900 dark:text-white">Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Total Users</h3>
          <p className="text-3xl font-light text-blue-600 dark:text-blue-400">{stats.totalUsers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Active Users</h3>
          <p className="text-3xl font-light text-green-600 dark:text-green-400">{stats.activeUsers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Destinations</h3>
          <p className="text-3xl font-light text-purple-600 dark:text-purple-400">{stats.totalDestinations}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Total Itineraries</h3>
          <p className="text-3xl font-light text-orange-600 dark:text-orange-400">{stats.totalItineraries}</p>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">User Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          // Toggle user role
                          const updatedUsers = users.map((u) => {
                            if (u.id === user.id) {
                              return { ...u, role: u.role === 'admin' ? 'user' : 'admin' }
                            }
                            return u
                          })
                          localStorage.setItem('users', JSON.stringify(updatedUsers))
                          setUsers(updatedUsers)
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Destination Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Destination Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {destinations.map((destination) => (
                  <tr key={destination.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{destination.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{destination.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          // Remove destination
                          const updatedDestinations = destinations.filter(d => d.id !== destination.id)
                          localStorage.setItem('destinations', JSON.stringify(updatedDestinations))
                          setDestinations(updatedDestinations)
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 