'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestPage() {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    const loadUsers = async () => {
      const { data, error } = await supabase.from('users').select('*')
      if (error) console.error(error)
      else setUsers(data || [])
    }
    loadUsers()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Users</h1>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name} – {u.email}</li>
        ))}
      </ul>
    </div>
  )
}
