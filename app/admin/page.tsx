'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [destName, setDestName] = useState('')
  const [destDesc, setDestDesc] = useState('')
  const [destMsg, setDestMsg] = useState('')

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

  const handleAddDestination = async (e: React.FormEvent) => {
    e.preventDefault()
    setDestMsg('')
    const res = await fetch('/api/admin/destinations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: destName, description: destDesc })
    })
    const data = await res.json()
    if (data.success) {
      setDestMsg('Destination added!')
      setDestName('')
      setDestDesc('')
    } else {
      setDestMsg(data.message || 'Error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Admin Dashboard</h1>
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Add Destination</h2>
        <form onSubmit={handleAddDestination} className="space-y-4 max-w-md">
          <input
            type="text"
            placeholder="Destination Name"
            value={destName}
            onChange={e => setDestName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            placeholder="Description"
            value={destDesc}
            onChange={e => setDestDesc(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
          {destMsg && <div className="text-green-600 mt-2">{destMsg}</div>}
        </form>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">All Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
            <thead>
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="p-2 border">{u.id}</td>
                  <td className="p-2 border">{u.name}</td>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 