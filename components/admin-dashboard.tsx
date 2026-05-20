'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

interface UserStats {
  totalUsers: number
  activeUsers: number
  totalDestinations: number
  totalItineraries: number
}

interface User {
  id: string | number
  name: string
  email: string
  role: 'user' | 'admin'
  lastLogin?: string
}

interface Destination {
  id: number
  name: string
  description: string
  category?: string | null
  region?: string | null
  image_url?: string | null
}

interface Review {
  id: number
  userId: number
  userName: string
  userEmail: string
  objectId: number
  destinationName: string
  rating: number
  comment: string | null
  createdAt: string
}

interface AdminUsersResponse {
  users?: User[]
  totalRoutes?: number
}

interface DestinationsResponse {
  destinations?: Destination[]
}

interface ReviewsResponse {
  success?: boolean
  reviews?: Review[]
}

const PASSWORD_REQUIREMENTS = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

const MAX_IMAGE_WIDTH = 1200
const MAX_IMAGE_HEIGHT = 900
const IMAGE_QUALITY = 0.78
const OUTPUT_IMAGE_TYPE = 'image/jpeg'

async function resizeImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Lūdzu izvēlieties attēla failu')
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_IMAGE_WIDTH / bitmap.width, MAX_IMAGE_HEIGHT / bitmap.height)
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')

  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result)
        } else {
          reject(new Error('Neizdevās saspiest attēlu'))
        }
      },
      OUTPUT_IMAGE_TYPE,
      IMAGE_QUALITY,
    )
  })

  return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: OUTPUT_IMAGE_TYPE })
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nezināma kļūda'
}

export default function AdminDashboard() {
  const { user, isAdmin, updateUserRole } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalDestinations: 0,
    totalItineraries: 0,
  })
  const [users, setUsers] = useState<User[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: '',
    region: '',
    imageUrl: '',
  })
  const [destName, setDestName] = useState('')
  const [destDesc, setDestDesc] = useState('')
  const [destImageFile, setDestImageFile] = useState<File | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [destMsg, setDestMsg] = useState('')
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin',
  })
  const [userMsg, setUserMsg] = useState('')
  const [userError, setUserError] = useState('')
  const [reviewForm, setReviewForm] = useState({
    destinationId: '',
    userId: '',
    rating: '5',
    comment: '',
  })
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null)
  const [reviewMsg, setReviewMsg] = useState('')
  const [reviewError, setReviewError] = useState('')

  const loadAdminData = async () => {
    try {
      const [usersRes, destinationsRes, reviewsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/destinations'),
        fetch('/api/admin/reviews'),
      ])

      const usersData = (await usersRes.json()) as AdminUsersResponse
      const destinationsData = (await destinationsRes.json()) as DestinationsResponse
      const reviewsData = (await reviewsRes.json()) as ReviewsResponse

      const loadedUsers = usersData.users ?? []
      const loadedDestinations = destinationsData.destinations ?? []

      setUsers(loadedUsers)
      setDestinations(loadedDestinations)
      setReviews(reviewsData.success ? reviewsData.reviews ?? [] : [])

      const activeThreshold = Date.now() - 2 * 60 * 1000
      const activeUsers = loadedUsers.filter((u: User) => {
        if (u.role === "admin") return false
        if (!u.lastLogin) return false
        const lastSeen = new Date(u.lastLogin).getTime()
        return Number.isFinite(lastSeen) && lastSeen >= activeThreshold
      }).length

      setStats({
        totalUsers: loadedUsers.length,
        activeUsers,
        totalDestinations: loadedDestinations.length,
        totalItineraries: typeof usersData.totalRoutes === 'number' ? usersData.totalRoutes : 0,
      })
    } catch (error) {
      console.error('Kļūda ielādējot administratora datus:', error)
    }
  }

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/')
      return
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
      imageUrl: destination.image_url || '',
    })
  }

  const uploadImage = async (file: File): Promise<string> => {
  const compressedFile = await resizeImage(file)

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Neizdevās nolasīt attēlu'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Neizdevās nolasīt attēlu'))
    }

    reader.readAsDataURL(compressedFile)
  })
}

  const handleEditSubmit = async (e: FormEvent) => {
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
        body: JSON.stringify({ ...editForm, imageUrl }),
      })

      const data = await res.json()

      if (data.success) {
        const updatedDestinations = destinations.map((destination) =>
          destination.id === editingDestination.id
            ? { ...destination, ...editForm, image_url: imageUrl }
            : destination
        )

        setDestinations(updatedDestinations)
        setStats((prevStats) => ({
          ...prevStats,
          totalDestinations: updatedDestinations.length,
        }))
        setEditingDestination(null)
        setEditImageFile(null)
      }
    } catch (error) {
      console.error('Kļūda atjauninot galamērķi:', error)
    }
  }

  const handleDeleteDestination = async (destinationId: number) => {
    if (!confirm('Vai tiešām vēlaties dzēst šo galamērķi?')) return

    try {
      const res = await fetch(`/api/admin/destinations/${destinationId}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (data.success) {
        const updatedDestinations = destinations.filter(
          (destination) => destination.id !== destinationId
        )

        setDestinations(updatedDestinations)
        setStats((prevStats) => ({
          ...prevStats,
          totalDestinations: updatedDestinations.length,
        }))
      }
    } catch (error) {
      console.error('Kļūda dzēšot galamērķi:', error)
    }
  }

  const handleToggleRole = async (userId: string | number, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role: newRole }),
      })

      const data = await res.json()

      if (data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((existingUser) =>
            existingUser.id === userId ? { ...existingUser, role: newRole } : existingUser
          )
        )

        if (user && String(user.id) === String(userId)) {
          updateUserRole(userId, newRole)
        }
      } else {
        alert(data.message || 'Neizdevās atjaunināt lietotāja lomu.')
      }
    } catch (error) {
      console.error('Kļūda atjauninot lietotāja lomu:', error)
      alert('Neizdevās atjaunināt lietotāja lomu.')
    }
  }

  const handleAddUser = async (e: FormEvent) => {
    e.preventDefault()
    setUserMsg('')
    setUserError('')

    if (!PASSWORD_REQUIREMENTS.test(userForm.password)) {
      setUserError(
        'Parolei jābūt vismaz 8 rakstzīmes garai, ar vienu lielo burtu, vienu ciparu un vienu speciālo simbolu.'
      )
      return
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setUserError(data.message || 'Neizdevās pievienot lietotāju.')
        return
      }

      const updatedUsers = [data.user, ...users]

      setUsers(updatedUsers)
      setStats((prevStats) => ({
        ...prevStats,
        totalUsers: updatedUsers.length,
      }))
      setUserForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
      })
      setUserMsg('Lietotājs veiksmīgi pievienots.')
    } catch {
      setUserError('Neizdevās pievienot lietotāju.')
    }
  }

  const handleDeleteUser = async (userId: string | number) => {
    if (String(user?.id) === String(userId)) {
      alert('Jūs nevarat dzēst savu kontu administratora panelī.')
      return
    }

    if (!confirm('Vai tiešām vēlaties dzēst šo lietotāju un viņa datus?')) return

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        alert(data.message || 'Neizdevās dzēst lietotāju.')
        return
      }

      const updatedUsers = users.filter((existingUser) => String(existingUser.id) !== String(userId))

      setUsers(updatedUsers)
      setReviews((prevReviews) =>
        prevReviews.filter((review) => String(review.userId) !== String(userId))
      )
      setStats((prevStats) => ({
        ...prevStats,
        totalUsers: updatedUsers.length,
      }))
    } catch {
      alert('Neizdevās dzēst lietotāju.')
    }
  }

  const handleAddDestination = async (e: FormEvent) => {
    e.preventDefault()
    setDestMsg('')

    try {
      let imageUrl: string | undefined

      if (destImageFile) {
        try {
          imageUrl = await uploadImage(destImageFile)
        } catch (uploadError: unknown) {
          setDestMsg(`Attēla augšupielādes kļūda: ${getErrorMessage(uploadError)}`)
          return
        }
      }

      const res = await fetch('/api/admin/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: destName,
          description: destDesc,
          imageUrl,
        }),
      })

      const data = await res.json()

      if (data.success) {
        const newDestination: Destination = {
          id: data.id,
          name: destName,
          description: destDesc,
          category: null,
          region: null,
          image_url: imageUrl,
        }

        const updatedDestinations = [...destinations, newDestination]

        setDestinations(updatedDestinations)
        setStats((prevStats) => ({
          ...prevStats,
          totalDestinations: updatedDestinations.length,
        }))
        setDestName('')
        setDestDesc('')
        setDestImageFile(null)
        setDestMsg('Galamērķis veiksmīgi pievienots')
      } else {
        setDestMsg(data.message || 'Kļūda pievienojot galamērķi')
      }
    } catch (error: unknown) {
      setDestMsg(`Kļūda: ${getErrorMessage(error)}`)
    }
  }

  const resetReviewForm = () => {
    setReviewForm({
      destinationId: '',
      userId: '',
      rating: '5',
      comment: '',
    })
    setEditingReviewId(null)
  }

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setReviewMsg('')
    setReviewError('')

    const payload = {
      destinationId: reviewForm.destinationId,
      userId: reviewForm.userId,
      rating: Number(reviewForm.rating),
      comment: reviewForm.comment,
    }

    try {
      const res = await fetch(
        editingReviewId ? `/api/admin/reviews/${editingReviewId}` : '/api/admin/reviews',
        {
          method: editingReviewId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      const data = await res.json()

      if (!res.ok || !data.success) {
        setReviewError(data.message || 'Neizdevās saglabāt komentāru.')
        return
      }

      if (editingReviewId) {
        const selectedDestination = destinations.find(
          (destination) => String(destination.id) === String(reviewForm.destinationId)
        )
        const selectedUser = users.find(
          (existingUser) => String(existingUser.id) === String(reviewForm.userId)
        )

        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === editingReviewId
              ? {
                  ...review,
                  objectId: Number(reviewForm.destinationId),
                  destinationName: selectedDestination?.name || review.destinationName,
                  userId: Number(reviewForm.userId),
                  userName: selectedUser?.name || review.userName,
                  userEmail: selectedUser?.email || review.userEmail,
                  rating: Number(reviewForm.rating),
                  comment: reviewForm.comment,
                }
              : review
          )
        )
        setReviewMsg('Komentārs veiksmīgi atjaunināts.')
      } else {
        setReviews((prevReviews) => [data.review, ...prevReviews])
        setReviewMsg('Komentārs veiksmīgi pievienots.')
      }

      resetReviewForm()
    } catch {
      setReviewError('Neizdevās saglabāt komentāru.')
    }
  }

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review.id)
    setReviewForm({
      destinationId: String(review.objectId),
      userId: String(review.userId),
      rating: String(review.rating),
      comment: review.comment || '',
    })
    setReviewMsg('')
    setReviewError('')
  }

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Vai tiešām vēlaties dzēst šo komentāru?')) return

    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        alert(data.message || 'Neizdevās dzēst komentāru.')
        return
      }

      setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId))
    } catch {
      alert('Neizdevās dzēst komentāru.')
    }
  }

  if (!isAdmin()) return null

  return (
    <div className="container mx-auto px-4 py-8">
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
          <p className="text-3xl font-light text-purple-600 dark:text-purple-400">
            {stats.totalDestinations}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Maršruti kopā</h3>
          <p className="text-3xl font-light text-orange-600 dark:text-orange-400">
            {stats.totalItineraries}
          </p>
        </div>
      </div>

      <div className="admin-clean-section mb-8">
        <div className="mb-5">
          <h2 className="text-xl font-medium text-slate-950">Pievienot lietotāju</h2>
          <p className="mt-1 text-sm text-slate-500">Izveidojiet jaunu kontu un piešķiriet tam lomu.</p>
        </div>

        <form onSubmit={handleAddUser} className="admin-clean-form">
            <input
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              placeholder="Vārds"
              className="admin-field"
              required
            />

            <input
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              placeholder="E-pasts"
              className="admin-field"
              required
            />

            <div>
              <input
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                placeholder="Parole"
                className="admin-field w-full"
                required
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                8+ rakstzīmes, lielais burts, cipars un speciālais simbols.
              </p>
            </div>

            <select
              value={userForm.role}
              onChange={(e) =>
                setUserForm({ ...userForm, role: e.target.value as 'user' | 'admin' })
              }
              className="admin-field"
            >
              <option value="user">Lietotājs</option>
              <option value="admin">Administrators</option>
            </select>

          <button type="submit" className="admin-primary-button">
            Pievienot
          </button>
        </form>

        {userError && <p className="mt-3 text-sm text-red-600">{userError}</p>}
        {userMsg && <p className="mt-3 text-sm text-green-600">{userMsg}</p>}
      </div>

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
                {users.map((existingUser, index) => (
                  <tr key={existingUser.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {existingUser.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {existingUser.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {existingUser.role === 'admin' ? 'Administrators' : 'Lietotājs'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleToggleRole(existingUser.id, existingUser.role)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        {existingUser.role === 'admin' ? 'Padarīt par lietotāju' : 'Padarīt par administratoru'}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(existingUser.id)}
                        disabled={String(user?.id) === String(existingUser.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-40 disabled:cursor-not-allowed"
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Pievienot galamērķi</h2>

          <form onSubmit={handleAddDestination} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nosaukums
              </label>
              <input
                type="text"
                placeholder="Galamērķa nosaukums"
                value={destName}
                onChange={(e) => setDestName(e.target.value)}
                className="admin-field w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Apraksts
              </label>
              <textarea
                placeholder="Apraksts"
                value={destDesc}
                onChange={(e) => setDestDesc(e.target.value)}
                className="admin-field w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Attēls
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setDestImageFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-700 dark:text-gray-300"
              />
            </div>

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Pievienot galamērķi
            </button>

            {destMsg && <div className="text-green-600 mt-2">{destMsg}</div>}
          </form>
        </div>
      </div>

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
                {destinations.map((destination, index) => (
                  <tr key={destination.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {destination.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white line-clamp-2">
                      {destination.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {destination.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {destination.region || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleEditClick(destination)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        Labot
                      </button>

                      <button
                        onClick={() => handleDeleteDestination(destination.id)}
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

      <div className="admin-clean-section mt-8">
        <div className="mb-5">
          <h2 className="text-xl font-medium text-slate-950">Galamērķu komentāru pārvaldība</h2>
          <p className="mt-1 text-sm text-slate-500">Pievienojiet, labojiet vai dzēsiet galamērķu atsauksmes.</p>
        </div>

        <form onSubmit={handleReviewSubmit} className="admin-clean-form mb-6">
            <select
              value={reviewForm.destinationId}
              onChange={(e) => setReviewForm({ ...reviewForm, destinationId: e.target.value })}
              className="admin-field"
              required
            >
              <option value="">Izvēlieties galamērķi</option>
              {destinations.map((destination) => (
                <option key={destination.id} value={destination.id}>
                  {destination.name}
                </option>
              ))}
            </select>

            <select
              value={reviewForm.userId}
              onChange={(e) => setReviewForm({ ...reviewForm, userId: e.target.value })}
              className="admin-field"
              required
            >
              <option value="">Izvēlieties lietotāju</option>
              {users.map((existingUser) => (
                <option key={existingUser.id} value={existingUser.id}>
                  {existingUser.name} ({existingUser.email})
                </option>
              ))}
            </select>

            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
              className="admin-field"
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} zvaigznes
                </option>
              ))}
            </select>

            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Komentārs"
              className="admin-field"
              required
            />

            <div className="flex gap-2">
              <button type="submit" className="admin-primary-button flex-1">
                {editingReviewId ? 'Saglabāt' : 'Pievienot'}
              </button>

              {editingReviewId && (
                <button type="button" onClick={resetReviewForm} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Atcelt
                </button>
              )}
            </div>
          </form>

          {reviewError && <p className="mb-3 text-sm text-red-600">{reviewError}</p>}
          {reviewMsg && <p className="mb-3 text-sm text-green-600">{reviewMsg}</p>}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Galamērķis</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lietotājs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vērtējums</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Komentārs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Darbības</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {review.destinationName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {review.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {review.rating}/5
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-lg">
                      {review.comment}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        Labot
                      </button>

                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        Dzēst
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {reviews.length === 0 && (
              <p className="py-4 text-sm text-gray-600 dark:text-gray-300">Komentāru vēl nav.</p>
            )}
        </div>
      </div>

      {editingDestination && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[9999]">
    <div className="bg-[#ffffff] rounded-lg p-6 max-w-md w-full shadow-2xl">
      <h3 className="text-xl font-medium text-gray-900 mb-4">
        Labot galamērķi
      </h3>

      <form onSubmit={handleEditSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nosaukums
          </label>

          <input
            type="text"
            value={editForm.name}
            onChange={(e) =>
              setEditForm({ ...editForm, name: e.target.value })
            }
            className="w-full p-2 border rounded bg-white border-gray-300 text-gray-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apraksts
          </label>

          <textarea
            value={editForm.description}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                description: e.target.value,
              })
            }
            className="w-full p-2 border rounded bg-white border-gray-300 text-gray-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategorija
          </label>

          <input
            type="text"
            value={editForm.category}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                category: e.target.value,
              })
            }
            className="w-full p-2 border rounded bg-white border-gray-300 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reģions
          </label>

          <input
            type="text"
            value={editForm.region}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                region: e.target.value,
              })
            }
            className="w-full p-2 border rounded bg-white border-gray-300 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jauns attēls
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setEditImageFile(e.target.files?.[0] || null)
            }
            className="w-full text-sm text-gray-700"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={() => setEditingDestination(null)}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
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