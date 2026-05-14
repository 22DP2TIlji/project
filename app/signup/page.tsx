'use client'

import { useState } from 'react'
import Link from "next/link"
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const { signup, isAuthenticated } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  // Novirzīt, ja lietotājs jau ir autentificējies
  if (isAuthenticated) {
    router.push('/profile')
    return null
  }

  const isStrongPassword = (value: string) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !confirmPassword) {
      setError('Lūdzu, aizpildiet visus laukus')
      return
    }

    if (password !== confirmPassword) {
      setError('Paroles nesakrīt')
      return
    }

    if (!isStrongPassword(password)) {
      setError('Parolei jābūt vismaz 8 rakstzīmes garai, ar vienu lielo burtu, vienu ciparu un vienu speciālo simbolu.')
      return
    }

    const result = await signup(name, email, password)

    if (result.success) {
      router.push('/profile') 
    } else if (result.message) {
      setError(result.message)
    } else {
      setError('Šis e-pasts jau ir reģistrēts')
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="mb-8 text-center">
          <span className="eyebrow">Jauns ceļojums</span>
          <h2 className="text-3xl font-black text-slate-950">Izveidot kontu</h2>
          <p className="mt-2 text-sm text-slate-500">Saglabā maršrutus, izlasi un ceļojuma sagatavošanās darbus.</p>
        </div>
        
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="mb-2 block text-sm font-bold text-slate-700">
              Vārds
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white/90 p-3.5 text-slate-950 shadow-sm"
              placeholder="Jānis Bērziņš"
              required
            />
          </div>

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
              required
            />
          </div>

          <div className="mb-4">
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
             <p className="mt-2 text-xs font-medium text-slate-500">
              Parolei jābūt vismaz 8 rakstzīmes garai, ar vismaz vienu lielo burtu, vienu ciparu un vienu speciālo simbolu (piemēram, punktu).
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-bold text-slate-700">
              Apstipriniet paroli
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
             className="w-full rounded-2xl border border-slate-200 bg-white/90 p-3.5 text-slate-950 shadow-sm"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-950 px-4 py-3.5 font-black text-white shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-sky-700"
          >
            Reģistrēties
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-medium text-slate-600">
          Jums jau ir konts?{' '}
           <Link href="/login" className="font-black text-sky-700 hover:text-sky-900">
            Ienākt
          </Link>
        </div>
      </div>
    </div>
  )
}