'use client'

import { useState } from 'react'
import Link from "next/link"
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Novirzīt, ja lietotājs jau ir autorizējies
  if (isAuthenticated) {
    router.push('/profile')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Lūdzu, aizpildiet visus laukus')
      return
    }

    const success = await login(email, password)

    if (success.success) {
      router.push('/profile') 
    } else {
      setError('Nepareizs e-pasts vai parole')
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="mb-8 text-center">
          <span className="eyebrow">TravelLatvia</span>
          <h2 className="text-3xl font-black text-slate-950">Pieslēgties savam kontam</h2>
          <p className="mt-2 text-sm text-slate-500">Turpini plānot savus maršrutus un saglabātās idejas.</p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-700">
              E-pasts
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white/90 p-3.5 text-slate-950 shadow-sm"
              placeholder="jusu@pasts.lv"
              required
            />
          </div>

          <div className="mb-6">
<label htmlFor="password" className="mb-2 block text-sm font-bold text-slate-700">
              Parole
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white/90 p-3.5 text-slate-950 shadow-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-950 px-4 py-3.5 font-black text-white shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-sky-700"
          >
            Pieslēgties
          </button>
        </form>
<div className="mt-6 text-center text-sm font-medium text-slate-600">
        
          Nav konta?{' '}
          <Link href="/signup" className="font-black text-sky-700 hover:text-sky-900">
            Reģistrēties
          </Link>
        </div>
      </div>
    </div>
  )
}