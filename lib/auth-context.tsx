// lib/auth-context.tsx
'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
  savedDestinations: number[]
  savedItineraries?: any[]
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  saveDestination: (destinationId: number) => Promise<void>
  removeSavedDestination: (destinationId: number) => Promise<void>
  removeSavedItinerary: (itineraryId: string) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          // Refresh user data from server
          const response = await fetch('/api/auth/me', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: userData.id })
          })
          
          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              setUser(result.user)
            } else {
              localStorage.removeItem('user')
            }
          }
        }
      } catch (error) {
        console.error('Error loading user:', error)
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const result = await response.json()

      if (result.success && result.user) {
        setUser(result.user)
        localStorage.setItem('user', JSON.stringify(result.user))
        return { success: true }
      } else {
        return { success: false, message: result.message || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'An error occurred during login' }
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password })
      })

      const result = await response.json()

      if (result.success && result.user) {
        // Auto login after successful signup
        const userWithDefaults = { 
          ...result.user, 
          savedDestinations: [],
          savedItineraries: []
        }
        setUser(userWithDefaults)
        localStorage.setItem('user', JSON.stringify(userWithDefaults))
        return { success: true }
      } else {
        return { success: false, message: result.message || 'Signup failed' }
      }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, message: 'An error occurred during signup' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const saveDestination = async (destinationId: number) => {
    if (!user) return

    try {
      const response = await fetch('/api/users/liked-destinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          destinationId: destinationId
        })
      })

      if (response.ok) {
        // Update local state
        const updatedUser = {
          ...user,
          savedDestinations: [...user.savedDestinations, destinationId]
        }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error('Error saving destination:', error)
    }
  }

  const removeSavedDestination = async (destinationId: number) => {
    if (!user) return

    try {
      const response = await fetch(`/api/users/liked-destinations/${destinationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id })
      })

      if (response.ok) {
        // Update local state
        const updatedUser = {
          ...user,
          savedDestinations: user.savedDestinations.filter(id => id !== destinationId)
        }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error('Error removing destination:', error)
    }
  }

  const removeSavedItinerary = async (itineraryId: string) => {
    // Implement itinerary removal logic here
    console.log('Remove itinerary:', itineraryId)
  }

  const refreshUser = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/auth/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: user.id })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setUser(result.user)
          localStorage.setItem('user', JSON.stringify(result.user))
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  const value = {
    user,
    login,
    signup,
    logout,
    saveDestination,
    removeSavedDestination,
    removeSavedItinerary,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}