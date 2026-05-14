"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"

interface ThemeContextType {
  darkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [darkMode, setDarkMode] = useState(false)

  // Initialize dark mode from user preferences or system preference
  useEffect(() => {
    if ((user as any)?.preferences?.darkMode !== undefined) {
      setDarkMode((user as any).preferences.darkMode)
    } else {
      setDarkMode(false)
    }
  }, [(user as any)?.preferences?.darkMode])

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
} 