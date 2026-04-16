// lib/auth-context.tsx
'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Lietotajs {
  id: string
  name: string
  email: string
  role: string
  savedDestinations: number[]
  savedItineraries?: any[]
}

interface AuthContextType {
  user: Lietotajs | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: () => boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  saveDestination: (destinationId: number) => Promise<void>
  removeSavedDestination: (destinationId: number) => Promise<void>
  removeSavedItinerary: (itineraryId: string) => Promise<void>
  refreshUser: () => Promise<void>
  updateUserRole: (userId: string | number, role: 'user' | 'admin') => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Lietotajs | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Ielādēt lietotāju no localStorage pēc montēšanas
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const userData = JSON.parse(storedUser) as Lietotajs
          setUser(userData)
          try {
            const response = await fetch('/api/auth/me', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: userData.id })
            })
            if (response.ok) {
              const result = await response.json()
              if (result.success && result.user) {
                setUser(result.user)
                return
              }
              localStorage.removeItem('user')
              setUser(null)
              return
            }
          } catch {
            // Tīkla kļūda: izmantojam saglabāto lietotāju, lai administratora panelis varētu ielādēties
            setUser(userData)
            return
          }
          setUser(userData)
        }
      } catch (error) {
        console.error('Kļūda ielādējot lietotāju:', error)
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
        return { success: false, message: result.message || 'Pieslēgšanās neizdevās' }
      }
    } catch (error) {
      console.error('Pieslēgšanās kļūda:', error)
      return { success: false, message: 'Pieslēgšanās laikā radās kļūda' }
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
        // Automātiska pieslēgšanās pēc veiksmīgas reģistrācijas
        const userWithDefaults = { 
          ...result.user, 
          savedDestinations: [],
          savedItineraries: []
        }
        setUser(userWithDefaults)
        localStorage.setItem('user', JSON.stringify(userWithDefaults))
        return { success: true }
      } else {
        return { success: false, message: result.message || 'Reģistrācija neizdevās' }
      }
    } catch (error) {
      console.error('Reģistrācijas kļūda:', error)
      return { success: false, message: 'Reģistrācijas laikā radās kļūda' }
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

      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        const updatedUser = {
          ...user,
          savedDestinations: [...user.savedDestinations, destinationId]
        }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      } else {
        const msg = data?.message || `Neizdevās saglabāt (${response.status})`
        if (typeof window !== 'undefined') alert(msg)
      }
    } catch (error) {
      console.error('Kļūda saglabājot galamērķi:', error)
      if (typeof window !== 'undefined') alert('Neizdevās saglabāt vietu. Pārbaudiet savienojumu.')
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

      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        const updatedUser = {
          ...user,
          savedDestinations: user.savedDestinations.filter(id => id !== destinationId)
        }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      } else {
        const msg = data?.message || `Neizdevās noņemt (${response.status})`
        if (typeof window !== 'undefined') alert(msg)
      }
    } catch (error) {
      console.error('Kļūda noņemot galamērķi:', error)
      if (typeof window !== 'undefined') alert('Neizdevās noņemt vietu.')
    }
  }

  const removeSavedItinerary = async (itineraryId: string) => {
    // Šeit implementē maršruta noņemšanas loģiku
    console.log('Noņemt maršrutu:', itineraryId)
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
      console.error('Kļūda atsvaidzinot lietotāju:', error)
    }
  }

  const isAuthenticated = !!user

  const isAdmin = () => user?.role === 'admin'

  const updateUserRole = (userId: string | number, role: 'user' | 'admin') => {
    setUser(prev => {
      if (!prev || prev.id !== userId) return prev
      const updated = { ...prev, role }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    login,
    signup,
    logout,
    saveDestination,
    removeSavedDestination,
    removeSavedItinerary,
    refreshUser,
    updateUserRole
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
    throw new Error('useAuth ir jāizmanto AuthProvider ietvaros')
  }
  return context
}