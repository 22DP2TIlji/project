'use client'

import { useState } from 'react'
import Link from 'next/link'
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

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/profile')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    const result = await signup(name, email, password)

    if (result.success) {
      router.push('/profile') 
    } else if (result.message) {
      setError(result.message)
    } else {
      setError('Email already in use')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-light text-gray-900 dark:text-white">Create an account</h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              placeholder="John Doe"
              required
            />
          </div>

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

          <div className="mb-4">
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

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-3 px-4 text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-700 dark:text-gray-300">
          Already have an account?{' '}
          <Link href="/login" className="underline hover:text-blue-600 dark:hover:text-blue-400">
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
} 