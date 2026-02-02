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
  savedItineraries?: any[];
}

interface ReviewRow {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  objectId: number;
  destinationName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
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
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [editingReview, setEditingReview] = useState<ReviewRow | null>(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '' })
  const [userMsg, setUserMsg] = useState('')

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/')
      return
    }

    // Load admin data
    const loadAdminData = async () => {
      try {
        const [usersRes, destinationsRes, reviewsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/destinations'),
          fetch('/api/admin/reviews')
        ])
        
        const usersData = await usersRes.json()
        const destinationsData = await destinationsRes.json()
        const reviewsData = await reviewsRes.json()
        
        setUsers(usersData.users || [])
        setDestinations(destinationsData.destinations || [])
        setReviews(reviewsData.reviews || [])
        
        setStats((prevStats: UserStats) => ({
          ...prevStats,
          totalUsers: usersData.users?.length || 0,
          activeUsers: usersData.users?.filter((u: User) => u.lastLogin)?.length || 0,
          totalDestinations: destinationsData.destinations?.length || 0,
          totalItineraries: usersData.users?.reduce((acc: number, user: User) => 
            acc + (user.savedItineraries?.length || 0), 0) || 0
        }))
      } catch (error) {
        console.error('Error loading admin data:', error)
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
    // For Laragon/MySQL setup, you can either:
    // 1. Store images in public/images folder and return the path
    // 2. Use a different storage service (AWS S3, Cloudinary, etc.)
    // 3. Store base64 encoded images in the database (not recommended for large files)
    
    // For now, we'll convert to base64 and return it as a data URL
    // In production, you should upload to a proper storage service
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
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
      console.error('Error updating destination:', error)
    }
  }

  const handleDelete = async (destinationId: number) => {
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
      console.error('Error deleting destination:', error)
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
        // Update local state
        setUsers(users.map((u: User) => 
          u.id === userId 
            ? { ...u, role: newRole }
            : u
        ))
        // If the current admin's role is being changed, update in AuthContext
        if (user && user.id === userId) {
          updateUserRole(userId, newRole)
        }
      } else {
        console.error('Failed to update user role:', data.message)
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Delete this review?')) return
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      } else {
        alert(data.message || 'Failed to delete review')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Failed to delete review')
    }
  }

  const handleEditReviewClick = (r: ReviewRow) => {
    setEditingReview(r)
    setReviewForm({ rating: r.rating, comment: r.comment ?? '' })
  }

  const handleEditReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingReview) return
    try {
      const res = await fetch(`/api/admin/reviews/${editingReview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewForm.rating, comment: reviewForm.comment || null }),
      })
      const data = await res.json()
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === editingReview.id
              ? { ...r, rating: reviewForm.rating, comment: reviewForm.comment || null }
              : r
          )
        )
        setEditingReview(null)
      } else {
        alert(data.message || 'Failed to update review')
      }
    } catch (error) {
      console.error('Error updating review:', error)
      alert('Failed to update review')
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setUserMsg('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userForm.name.trim(),
          email: userForm.email.trim(),
          password: userForm.password,
        }),
      })
      const data = await res.json()
      if (data.success && data.user) {
        setUsers((prev) => [...prev, { id: data.user.id, name: data.user.name, email: data.user.email, role: 'user' }])
        setStats((prev) => ({ ...prev, totalUsers: (prev.totalUsers || 0) + 1 }))
        setUserForm({ name: '', email: '', password: '' })
        setUserMsg('User added successfully')
      } else {
        setUserMsg(data.message || 'Error adding user')
      }
    } catch (error: any) {
      setUserMsg(error?.message || 'Failed to add user')
    }
  }

  const handleDeleteUser = async (userId: string | number) => {
    if (userId === 'admin') {
      alert('Cannot delete the admin account')
      return
    }
    if (user && String(user.id) === String(userId)) {
      alert('You cannot delete your own account')
      return
    }
    if (!confirm('Delete this user? All their reviews, routes and saved places will be removed.')) return
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setUsers((prev) => prev.filter((u) => String(u.id) !== String(userId)))
        setStats((prev) => ({ ...prev, totalUsers: Math.max(0, (prev.totalUsers || 1) - 1) }))
      } else {
        alert(data.message || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
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
          console.log('Image uploaded successfully:', imageUrl)
        } catch (uploadError: any) {
          console.error('Image upload failed:', uploadError)
          setDestMsg(`Ошибка загрузки изображения: ${uploadError.message || 'Неизвестная ошибка'}`)
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
        setDestMsg('Destination added successfully')
      } else {
        setDestMsg(data.message || 'Error adding destination')
      }
    } catch (error: any) {
      console.error('Error adding destination:', error)
      setDestMsg(`Ошибка: ${error.message || 'Неизвестная ошибка'}`)
    }
  }

  if (!isAdmin()) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add User</h3>
            <form onSubmit={handleAddUser} className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Password (min 6)</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  minLength={6}
                  required
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Add User
              </button>
              {userMsg && <span className="text-sm text-green-600 dark:text-green-400">{userMsg}</span>}
            </form>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">№</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((u: User, index: number) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{u.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                      </button>
                      {u.id !== 'admin' && user && String(user.id) !== String(u.id) && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reviews Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Reviews (edit / delete)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Comment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {reviews.map((r) => (
                  <tr key={r.id}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{r.destinationName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{r.userName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{r.rating}/5</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">{r.comment ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleEditReviewClick(r)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReview(r.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reviews.length === 0 && (
              <p className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Destination Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Add Destination</h2>
          <form onSubmit={handleAddDestination} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text"
                placeholder="Destination Name"
                value={destName}
                onChange={e => setDestName(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                placeholder="Description"
                value={destDesc}
                onChange={e => setDestDesc(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setDestImageFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-700 dark:text-gray-300"
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Destination</button>
            {destMsg && <div className="text-green-600 mt-2">{destMsg}</div>}
          </form>
        </div>
      </div>

      {/* Destination Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mt-8">
        <div className="p-6">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Destination Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">№</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Region</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {destinations.map((destination: Destination, index: number) => (
                  <tr key={destination.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{destination.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{destination.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{destination.category || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{destination.region || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleEditClick(destination)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(destination.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Edit Review</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {editingReview.destinationName} — {editingReview.userName}
            </p>
            <form onSubmit={handleEditReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating (1–5)</label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comment</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Destination Modal */}
      {editingDestination && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Edit Destination</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region</label>
                <input
                  type="text"
                  value={editForm.region}
                  onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-700 dark:text-gray-300"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingDestination(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}