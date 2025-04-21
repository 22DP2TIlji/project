"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => boolean
  signup: (name: string, email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = (email: string, password: string): boolean => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // Find user with matching email and password
    const foundUser = users.find((u: any) => u.email === email && u.password === password)

    if (foundUser) {
      // Create a user object without the password
      const loggedInUser = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
      }

      // Store in state and localStorage
      setUser(loggedInUser)
      localStorage.setItem("currentUser", JSON.stringify(loggedInUser))

      // Migrate any likes from localStorage to the user account
      migrateLocalLikes(foundUser.id)

      return true
    }

    return false
  }

  const signup = (name: string, email: string, password: string): boolean => {
    // Get existing users
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // Check if email already exists
    if (users.some((u: any) => u.email === email)) {
      return false
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      likes: {},
    }

    // Add to users array
    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    // Log in the new user
    const loggedInUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    }

    setUser(loggedInUser)
    localStorage.setItem("currentUser", JSON.stringify(loggedInUser))

    // Migrate any likes from localStorage to the user account
    migrateLocalLikes(newUser.id)

    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  const migrateLocalLikes = (userId: string) => {
    // Get local likes
    const localLikes = JSON.parse(localStorage.getItem("likedDestinations") || "{}")

    if (Object.keys(localLikes).length === 0) {
      return
    }

    // Get users
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // Find user
    const userIndex = users.findIndex((u: any) => u.id === userId)

    if (userIndex !== -1) {
      // Merge local likes with user likes
      users[userIndex].likes = { ...users[userIndex].likes, ...localLikes }

      // Update users in localStorage
      localStorage.setItem("users", JSON.stringify(users))

      // Clear local likes
      localStorage.removeItem("likedDestinations")
    }
  }

  return <AuthContext.Provider value={{ user, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

