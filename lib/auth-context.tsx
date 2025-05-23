// lib/auth-context.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import pool from './db';

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
    // Check for existing session
    const checkSession = async () => {
      try {
        const session = localStorage.getItem('session');
        if (session) {
          const [rows] = await pool.execute(
            'SELECT * FROM users WHERE id = ?',
            [session]
          );
          const users = rows as User[];
          if (users.length > 0) {
            setUser(users[0]);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password]
      );
      const users = rows as User[];
      
      if (users.length > 0) {
        const user = users[0];
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('session', user.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Check if email already exists
      const [existingUsers] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      if ((existingUsers as User[]).length > 0) {
        return false;
      }

      // Create new user
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, password, 'user']
      );

      const insertResult = result as any;
      if (insertResult.insertId) {
        const [rows] = await pool.execute(
          'SELECT * FROM users WHERE id = ?',
          [insertResult.insertId]
        );
        const newUser = (rows as User[])[0];
        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem('session', newUser.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('session');
  };

  const updatePreferences = async (preferences: Partial<User['preferences']>) => {
    if (!user) return;

    try {
      await pool.execute(
        'UPDATE users SET preferences = ? WHERE id = ?',
        [JSON.stringify(preferences), user.id]
      );

      setUser({
        ...user,
        preferences: {
          ...user.preferences,
          ...preferences
        }
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const saveDestination = async (destinationId: string) => {
    if (!user) return;

    try {
      await pool.execute(
        'INSERT INTO user_destinations (user_id, destination_id) VALUES (?, ?)',
        [user.id, destinationId]
      );

      setUser({
        ...user,
        savedDestinations: [...(user.savedDestinations || []), destinationId]
      });
    } catch (error) {
      console.error('Error saving destination:', error);
    }
  };

  const removeSavedDestination = async (destinationId: string) => {
    if (!user) return;

    try {
      await pool.execute(
        'DELETE FROM user_destinations WHERE user_id = ? AND destination_id = ?',
        [user.id, destinationId]
      );

      setUser({
        ...user,
        savedDestinations: user.savedDestinations?.filter(id => id !== destinationId)
      });
    } catch (error) {
      console.error('Error removing destination:', error);
    }
  };

  const saveItinerary = async (itinerary: any) => {
    if (!user) return;

    try {
      await pool.execute(
        'INSERT INTO user_itineraries (user_id, itinerary_id) VALUES (?, ?)',
        [user.id, itinerary.id]
      );

      setUser({
        ...user,
        savedItineraries: [...(user.savedItineraries || []), itinerary]
      });
    } catch (error) {
      console.error('Error saving itinerary:', error);
    }
  };

  const removeSavedItinerary = async (itineraryId: string) => {
    if (!user) return;

    try {
      await pool.execute(
        'DELETE FROM user_itineraries WHERE user_id = ? AND itinerary_id = ?',
        [user.id, itineraryId]
      );

      setUser({
        ...user,
        savedItineraries: user.savedItineraries?.filter(i => i.id !== itineraryId)
      });
    } catch (error) {
      console.error('Error removing itinerary:', error);
    }
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
