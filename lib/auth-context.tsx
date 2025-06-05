// lib/auth-context.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { getUserFromId } from '@/lib/auth-utils'; // Import the helper using alias
// import pool from './db'; // Remove direct database import

interface User {
  id: string | number; // Allow number type for user ID
  name: string;
  email: string;
  role: 'user' | 'admin';
  preferences?: {
    darkMode: boolean;
    preferredTransportMode: string;
    language: string;
  };
  // Change savedDestinations to be an array of destination IDs (strings)
  savedDestinations?: number[];
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
  // Update save/remove functions to work with destination ID strings
  saveDestination: (destinationId: number) => Promise<void>;
  removeSavedDestination: (destinationId: number) => Promise<void>;
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
      console.log('Auth useEffect: Checking for session', session);
      if (session) {
        try {
          // Fetch user data including liked destinations
          console.log('Auth useEffect: Fetching user data for session', session);
          const response = await fetch('/api/auth/me', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Send session ID in the body for the backend to fetch user
            body: JSON.stringify({ id: session }),
          })
          const data = await response.json()
          console.log('Auth useEffect: /api/auth/me response data:', data);
          if (response.ok && data.success) {
            console.log('Auth useEffect: User fetched successfully', data.user);
            setUser(data.user)
            setIsAuthenticated(true)
          } else {
            console.log('Auth useEffect: Failed to fetch user', data.message);
            setUser(null)
            setIsAuthenticated(false)
          }
        } catch (error) {
          console.error('Auth useEffect: Error fetching user from session:', error);
          setUser(null)
          setIsAuthenticated(false)
        }
      } else {
        console.log('Auth useEffect: No session found');
        setUser(null)
        setIsAuthenticated(false)
      }
    }
    // fetchUser() // Temporarily disabled to debug login flow
  }, [isAuthenticated])

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Login called for email:', email);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login /api/auth/login response data:', data);

      if (response.ok && data.success) {
        console.log('Login successful, setting user:', data.user);
        setUser(data.user); // Backend should return user with savedDestinations
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
     console.log('Signup called for email:', email);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      console.log('Signup /api/auth/signup response data:', data);

      if (response.ok && data.success) {
         console.log('Signup successful, setting user:', data.user);
        setUser(data.user); // Backend should return user with savedDestinations
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
    console.log('Logout called');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('session');
    // Optionally call an API route to invalidate session on the server
  };

  const updatePreferences = async (preferences: Partial<User['preferences']>) => {
     if (!user) {
        console.log('updatePreferences: User not logged in');
        return;
     }
     console.log('Update preferences called for user:', user.id, preferences);
     // This should also call an API route
  };

  const saveDestination = async (destinationId: number) => {
     if (!user) {
        console.log('saveDestination: User not logged in');
        return; // Must be logged in
     }
     console.log('saveDestination called for user:', user.id, 'destinationId:', destinationId);
     try {
       // Ensure destinationId is sent as number if backend expects it
       const response = await fetch('/api/users/liked-destinations', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ userId: user.id, destinationId: destinationId }), // Send number ID
       });
       const data = await response.json();
       console.log('saveDestination /api/users/liked-destinations response data:', data);
       if (response.ok && data.success) {
         console.log('saveDestination successful, updating user state');
         // Update user state with the new liked destination
         setUser(prevUser => {
           if (!prevUser) return null;
           const updatedSaved = [...(prevUser.savedDestinations || []), destinationId];
           console.log('setUser in saveDestination: updatedSaved', updatedSaved);
           return { ...prevUser, savedDestinations: updatedSaved };
         });
       } else {
         console.error('Failed to save destination:', data.message);
       }
     } catch (error) {
       console.error('Error saving destination:', error);
     }
  };

  const removeSavedDestination = async (destinationId: number) => {
     if (!user) {
        console.log('removeSavedDestination: User not logged in');
        return; // Must be logged in
     }
      console.log('removeSavedDestination called for user:', user.id, 'destinationId:', destinationId);
     try {
       // Use the DELETE endpoint with destination ID in the path
       const response = await fetch(`/api/users/liked-destinations/${destinationId}`, {
         method: 'DELETE',
         headers: { 'Content-Type': 'application/json' },
          // Send user ID in the body for backend verification (optional, could use headers/session)
          body: JSON.stringify({ userId: user.id }),
       });
       const data = await response.json();
       console.log('removeSavedDestination /api/users/liked-destinations response data:', data);
       if (response.ok && data.success) {
         console.log('removeSavedDestination successful, updating user state');
         // Update user state by removing the liked destination
         setUser(prevUser => {
           if (!prevUser) return null;
           // Filter expects number IDs
           const updatedSaved = (prevUser.savedDestinations || []).filter(id => id !== destinationId);
           console.log('setUser in removeSavedDestination: updatedSaved', updatedSaved);
           return { ...prevUser, savedDestinations: updatedSaved };
         });
       } else {
         console.error('Failed to remove saved destination:', data.message);
       }
     } catch (error) {
       console.error('Error removing saved destination:', error);
     }
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
