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

interface User {
  id: string | number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  lastLogin?: string;
}

interface Destination {
  id: number;
  name: string;
  description: string;
  category?: string | null;
  region?: string | null;
  image_url?: string | null;
}

export default function AdminDashboard() {
  const { user, isAdmin, updateUserRole } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalDestinations: 0,
    totalItineraries: 0
  })
  const [users, setUsers] = useState<User[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: '',
    region: '',
    imageUrl: ''
  })
  const [destName, setDestName] = useState('')
  const [destDesc, setDestDesc] = useState('')
  const [destImageFile, setDestImageFile] = useState<File | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [destMsg, setDestMsg] = useState('')

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/')
      return
    }

    // Ielādēt administratora datus
    const loadAdminData = async () => {
      try {
        const [usersRes, destinationsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/destinations')
        ])
        
        const usersData = await usersRes.json()
        const destinationsData = await destinationsRes.json()
        
        setUsers(usersData.users || [])
        setDestinations(destinationsData.destinations || [])
        
        setStats((prevStats: UserStats) => ({
          ...prevStats,
          totalUsers: usersData.users?.length || 0,
          activeUsers: usersData.users?.filter((u: User) => u.lastLogin)?.length || 0,
          totalDestinations: destinationsData.destinations?.length || 0,
          totalItineraries:
            typeof usersData.totalRoutes === 'number'
              ? usersData.totalRoutes
              : 0,
        }))
      } catch (error) {
        console.error('Kļūda ielādējot administratora datus:', error)
      }
    }

    loadAdminData()
  }, [isAdmin, router])

  const handleEditClick = (destination: Destination) => {
    setEditingDestination(destination)
    setEditForm({
      name: destination.name,
      description: destination.description,
      category: destination.category || '',
      region: destination.region || '',
      imageUrl: destination.image_url || ''
    })
  }

  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Neizdevās nolasīt failu'))
        }
      }
      reader.onerror = () => reject(new Error('Neizdevās nolasīt failu'))
      reader.readAsDataURL(file)
    })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDestination) return

    try {
      let imageUrl = editForm.imageUrl
      if (editImageFile) {
        imageUrl = await uploadImage(editImageFile)
      }

      const res = await fetch(`/api/admin/destinations/${editingDestination.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, imageUrl })
      })

      const data = await res.json()
      if (data.success) {
        const updatedDestinations = destinations.map((d: Destination) => 
          d.id === editingDestination.id 
            ? { ...d, ...editForm, image_url: imageUrl }
            : d
        )
        setDestinations(updatedDestinations)
        setStats((prevStats: UserStats) => ({ ...prevStats, totalDestinations: updatedDestinations.length }))
        setEditingDestination(null)
      }
    } catch (error) {
      console.error('Kļūda atjauninot galamērķi:', error)
    }
  }

  const handleDelete = async (destinationId: number) => {
    if (!confirm('Vai tiešām vēlaties dzēst šo galamērķi?')) return

    try {
      const res = await fetch(`/api/admin/destinations/${destinationId}`, {
        method: 'DELETE'
      })

      const data = await res.json()
      if (data.success) {
        const updatedDestinations = destinations.filter((d: Destination) => d.id !== destinationId)
        setDestinations(updatedDestinations)
        setStats((prevStats: UserStats) => ({ ...prevStats, totalDestinations: updatedDestinations.length }))
      }
    } catch (error) {
      console.error('Kļūda dzēšot galamērķi:', error)
    }
  }

  const handleToggleRole = async (userId: string | number, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    try {
      const res = await fetch(`/api/admin/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role: newRole })
      })

      const data = await res.json()
      if (data.success) {
        setUsers(users.map((u: User) => 
          u.id === userId 
            ? { ...u, role: newRole }
            : u
        ))
        if (user && user.id === userId) {
          updateUserRole(userId, newRole)
        }
      } else {
        console.error('Neizdevās atjaunināt lietotāja lomu:', data.message)
      }
    } catch (error) {
      console.error('Kļūda atjauninot lietotāja lomu:', error)
    }
  }

  const handleAddDestination = async (e: React.FormEvent) => {
    e.preventDefault()
    setDestMsg('')
    try {
      let imageUrl: string | undefined
      if (destImageFile) {
        try {
          imageUrl = await uploadImage(destImageFile)
        } catch (uploadError: any) {
          setDestMsg(`Attēla augšupielādes kļūda: ${uploadError.message || 'Nezināma kļūda'}`)
          return
        }
      }

      const res = await fetch('/api/admin/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: destName, description: destDesc, imageUrl })
      })

      const data = await res.json()
      if (data.success) {
        const newDestination: Destination = { id: data.id, name: destName, description: destDesc, category: null, region: null, image_url: imageUrl }
        const updatedDestinations = [...destinations, newDestination]
        setDestinations(updatedDestinations)
        setStats((prevStats: UserStats) => ({ ...prevStats, totalDestinations: updatedDestinations.length }))
        setDestName('')
        setDestDesc('')
        setDestImageFile(null)
        setDestMsg('Galamērķis veiksmīgi pievienots')
      } else {
        setDestMsg(data.message || 'Kļūda pievienojot galamērķi')
      }
    } catch (error: any) {
      setDestMsg(`Kļūda: ${error.message || 'Nezināma kļūda'}`)
    }
  }

  if (!isAdmin()) return null

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Statistikas pārskats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Lietotāji kopā</h3>
          <p className="text-3xl font-light text-blue-600 dark:text-blue-400">{stats.totalUsers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aktīvie lietotāji</h3>
          <p className="text-3xl font-light text-green-600 dark:text-green-400">{stats.activeUsers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Galamērķi</h3>
          <p className="text-3xl font-light text-purple-600 dark:text-purple-400">{stats.totalDestinations}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Maršruti kopā</h3>
          <p className="text-3xl font-light text-orange-600 dark:text-orange-400">{stats.totalItineraries}</p>
        </div>
      </div>

      {/* Lietotāju pārvaldība */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Lietotāju pārvaldība</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">№</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vārds</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">E-pasts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loma</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Darbības</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((u: User, index: number) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{u.role === 'admin' ? 'Administrators' : 'Lietotājs'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        {u.role === 'admin' ? 'Padarīt par lietotāju' : 'Padarīt par adminu'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pievienot galamērķi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Pievienot galamērķi</h2>
          <form onSubmit={handleAddDestination} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nosaukums</label>
              <input
                type="text"
                placeholder="Galamērķa nosaukums"
                value={destName}
                onChange={e => setDestName(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apraksts</label>
              <textarea
                placeholder="Apraksts"
                value={destDesc}
                onChange={e => setDestDesc(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attēls</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setDestImageFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-700 dark:text-gray-300"
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Pievienot galamērķi</button>
            {destMsg && <div className="text-green-600 mt-2">{destMsg}</div>}
          </form>
        </div>
      </div>

      {/* Galamērķu pārvaldība */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mt-8">
        <div className="p-6">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Galamērķu pārvaldība</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">№</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nosaukums</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Apraksts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kategorija</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reģions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Darbības</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {destinations.map((destination: Destination, index: number) => (
                  <tr key={destination.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{destination.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white line-clamp-2">{destination.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{destination.category || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{destination.region || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleEditClick(destination)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        Labot
                      </button>
                      <button
                        onClick={() => handleDelete(destination.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        Dzēst
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Labošanas modālais logs */}
      {editingDestination && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Labot galamērķi</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nosaukums</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apraksts</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategorija</label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reģions</label>
                <input
                  type="text"
                  value={editForm.region}
                  onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jauns attēls</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-700 dark:text-gray-300"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingDestination(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Atcelt
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
                >
                  Saglabāt izmaiņas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}