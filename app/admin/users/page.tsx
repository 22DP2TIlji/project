'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminUsersPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/')
    } else {
      fetch('/api/admin/users')
        .then(res => res.json())
        .then(data => setUsers(data.users || []))
    }
  }, [isAdmin, router])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">All Users</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
          <thead>
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Registered</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td className="p-2 border">{u.id}</td>
                <td className="p-2 border">{u.name}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">{u.role}</td>
                <td className="p-2 border">{u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 