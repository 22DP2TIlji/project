"use client"

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminUsersPage() {
  const { isAdmin, isLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    if (isLoading) return
    if (!isAdmin()) {
      router.push('/')
    } else {
      fetch('/api/admin/users')
        .then(res => res.json())
        .then(data => setUsers(data.users || []))
    }
  }, [isAdmin, isLoading, router])

  if (isLoading) {
    return (
      <div className="page-shell flex items-center justify-center">
        {/* "Loading..." -> "Ielādē..." */}
        <p className="text-gray-600 dark:text-gray-400">Ielādē...</p>
      </div>
    )
  }

  if (!isAdmin()) {
    return null
  }

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="page-hero mb-8">
          <span className="eyebrow">Administrēšana</span>
          <h1 className="text-3xl font-black text-slate-950 md:text-5xl">Visi lietotāji</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Pārskatiet reģistrētos lietotājus ar tīru, gaišu tabulas skatu.
          </p>
        </div>
        <div className="surface-card overflow-x-auto p-2">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
            <thead>
              <tr>
                <th className="p-2 border text-gray-900 dark:text-white text-left">ID</th>
                <th className="p-2 border text-gray-900 dark:text-white text-left">Vārds</th>
                <th className="p-2 border text-gray-900 dark:text-white text-left">E-pasts</th>
                <th className="p-2 border text-gray-900 dark:text-white text-left">Loma</th>
                <th className="p-2 border text-gray-900 dark:text-white text-left">Reģistrēts</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="p-2 border">{u.id}</td>
                  <td className="p-2 border">{u.name}</td>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border">{u.role}</td>
                  <td className="p-2 border">{u.created_at ? new Date(u.created_at).toLocaleDateString('lv-LV') : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
