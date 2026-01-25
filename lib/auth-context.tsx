// lib/auth-context.tsx
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

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
  isAuthenticated: boolean
  isAdmin: () => boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; user?: User }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string; user?: User }>
  logout: () => void
  saveDestination: (destinationId: number) => Promise<void>
  removeSavedDestination: (destinationId: number) => Promise<void>
  removeSavedItinerary: (itineraryId: string) => Promise<void>
  refreshUser: () => Promise<void>
  updateUserRole: (userId: string | number, role: "user" | "admin") => void
  updateProfile: (payload: { name?: string; email?: string; currentPassword: string; newPassword?: string }) => Promise<{
    success: boolean
    message?: string
  }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function persistUser(user: User) {
  localStorage.setItem("user", JSON.stringify(user))
  localStorage.setItem("userId", String(user.id)) // ✅ itinerary saving uses this
  localStorage.setItem("role", String(user.role || "user"))
}

function clearPersistedUser() {
  localStorage.removeItem("user")
  localStorage.removeItem("userId")
  localStorage.removeItem("role")
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const userData = JSON.parse(storedUser) as User

          const response = await fetch("/api/auth/me", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: userData.id }),
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success && result.user) {
              setUser(result.user)
              persistUser(result.user)
            } else {
              clearPersistedUser()
              setUser(null)
            }
          } else {
            clearPersistedUser()
            setUser(null)
          }
        }
      } catch (error) {
        console.error("Error loading user:", error)
        clearPersistedUser()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (result.success && result.user) {
        setUser(result.user)
        persistUser(result.user)
        return { success: true, user: result.user }
      } else {
        return { success: false, message: result.message || "Login failed" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "An error occurred during login" }
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const result = await response.json()

      if (result.success && result.user) {
        const userWithDefaults: User = {
          ...result.user,
          savedDestinations: result.user.savedDestinations ?? [],
          savedItineraries: result.user.savedItineraries ?? [],
        }

        setUser(userWithDefaults)
        persistUser(userWithDefaults)
        return { success: true, user: userWithDefaults }
      } else {
        return { success: false, message: result.message || "Signup failed" }
      }
    } catch (error) {
      console.error("Signup error:", error)
      return { success: false, message: "An error occurred during signup" }
    }
  }

  const logout = () => {
    setUser(null)
    clearPersistedUser()
  }

  const saveDestination = async (destinationId: number) => {
    if (!user) return

    try {
      const response = await fetch("/api/users/liked-destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          destinationId,
        }),
      })

      if (response.ok) {
        const updatedUser = {
          ...user,
          savedDestinations: [...user.savedDestinations, destinationId],
        }
        setUser(updatedUser)
        persistUser(updatedUser)
      }
    } catch (error) {
      console.error("Error saving destination:", error)
    }
  }

  const removeSavedDestination = async (destinationId: number) => {
    if (!user) return

    try {
      const response = await fetch(`/api/users/liked-destinations/${destinationId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        const updatedUser = {
          ...user,
          savedDestinations: user.savedDestinations.filter((id) => id !== destinationId),
        }
        setUser(updatedUser)
        persistUser(updatedUser)
      }
    } catch (error) {
      console.error("Error removing destination:", error)
    }
  }

  const removeSavedItinerary = async (itineraryId: string) => {
    // Implement DB delete later: /api/itineraries/[id]?userId=...
    console.log("Remove itinerary:", itineraryId)
  }

  const refreshUser = async () => {
    if (!user) return

    try {
      const response = await fetch("/api/auth/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.user) {
          setUser(result.user)
          persistUser(result.user)
        }
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
    }
  }

  // ✅ IMPORTANT: updateProfile MUST be inside AuthProvider so it can access user/setUser
  const updateProfile = async (payload: { name?: string; email?: string; currentPassword: string; newPassword?: string }) => {
    if (!user) return { success: false, message: "Not authenticated" }

    try {
      const res = await fetch("/api/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          ...payload,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        return { success: false, message: data?.message || "Failed to update profile" }
      }

      // refresh user via /api/auth/me to keep liked/saved consistent
      const me = await fetch("/api/auth/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      })

      if (me.ok) {
        const meData = await me.json()
        if (meData.success && meData.user) {
          setUser(meData.user)
          persistUser(meData.user)
        }
      }

      return { success: true }
    } catch (err) {
      console.error("updateProfile error:", err)
      return { success: false, message: "Server error" }
    }
  }

  const isAuthenticated = !!user
  const isAdmin = () => user?.role === "admin"

  const updateUserRole = (userId: string | number, role: "user" | "admin") => {
    setUser((prev) => {
      if (!prev || String(prev.id) !== String(userId)) return prev
      const updated = { ...prev, role }
      persistUser(updated)
      return updated
    })
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isAdmin,
    login,
    signup,
    logout,
    saveDestination,
    removeSavedDestination,
    removeSavedItinerary,
    refreshUser,
    updateUserRole,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
