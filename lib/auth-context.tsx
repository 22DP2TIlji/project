// lib/auth-context.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
// import pool from './db'; // Remove direct database import

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  preferences?: {
    darkMode: boolean;
    preferredTransportMode: string;
    language: string;
  };
  savedDestinations?: string[];
  savedItineraries?: any[];
  // Note: Storing passwords in localStorage is insecure. 
  // This is for demonstration purposes only.
  password?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
  saveDestination: (destinationId: string) => Promise<void>;
  removeSavedDestination: (destinationId: string) => Promise<void>;
  saveItinerary: (itinerary: any) => Promise<void>;
  removeSavedItinerary: (itineraryId: string) => Promise<void>;
  isAuthenticated: boolean;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const session = localStorage.getItem('session')
      if (session) {
        try {
          const response = await fetch('/api/auth/me', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: session }),
          })
          const data = await response.json()
          if (response.ok && data.success) {
            setUser(data.user)
            setIsAuthenticated(true)
          } else {
            setUser(null)
            setIsAuthenticated(false)
          }
        } catch (error) {
          setUser(null)
          setIsAuthenticated(false)
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    }
    fetchUser()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Call a server-side API route for login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('session', data.user.id); // Store session ID
        return true;
      } else {
        console.error('Login failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Call a server-side API route for signup
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('session', data.user.id); // Store session ID
        return true;
      } else {
         console.error('Signup failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('session');
    // Optionally call an API route to invalidate session on the server
  };

  const updatePreferences = async (preferences: Partial<User['preferences']>) => {
     if (!user) return;
    // This should also call an API route
     console.log('Update preferences called for user:', user.id, preferences);
  };

  const saveDestination = async (destinationId: string) => {
     if (!user) return;
    // This should also call an API route
     console.log('Save destination called for user:', user.id, destinationId);
  };

  const removeSavedDestination = async (destinationId: string) => {
     if (!user) return;
    // This should also call an API route
     console.log('Remove saved destination called for user:', user.id, destinationId);
  };

  const saveItinerary = async (itinerary: any) => {
     if (!user) return;
     // This should also call an API route
     console.log('Save itinerary called for user:', user.id, itinerary);
  };

  const removeSavedItinerary = async (itineraryId: string) => {
     if (!user) return;
     // This should also call an API route
     console.log('Remove saved itinerary called for user:', user.id, itineraryId);
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin,
        updatePreferences,
        saveDestination,
        removeSavedDestination,
        saveItinerary,
        removeSavedItinerary,
        isAuthenticated,
        signup
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
