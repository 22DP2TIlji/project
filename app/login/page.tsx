'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/')
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    const success = login(email, password)

    if (success) {
      // Redirect to home or dashboard on successful login
      router.push('/') 
    } else {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-light text-gray-900 dark:text-white">Log in to your account</h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-3 px-4 text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Log in
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-700 dark:text-gray-300">
          Don't have an account?{' '}
          <Link href="/signup" className="underline hover:text-blue-600 dark:hover:text-blue-400">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
} 