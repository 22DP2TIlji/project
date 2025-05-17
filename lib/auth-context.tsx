// lib/auth-context.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

interface User {
  id: string;
  name: string;
  email: string;
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
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updatePreferences: (preferences: Partial<User['preferences']>) => void;
  saveDestination: (destinationId: string) => void;
  removeSavedDestination: (destinationId: string) => void;
  saveItinerary: (itinerary: any) => void;
  removeSavedItinerary: (itineraryId: string) => void;
  isAuthenticated: boolean;
  signup: (name: string, email: string, password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on initial load
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
      // Clear invalid data if parsing fails
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Save user to localStorage whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Login function: finds user by email and password
  const login = (email: string, password: string): boolean => {
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      // In a real app, compare hashed passwords
      const foundUser = users.find((u: any) => u.email === email && u.password === password);

      if (foundUser) {
        setUser(foundUser);
        setIsAuthenticated(true);
        console.log("User logged in:", foundUser.email);
        return true;
      } else {
        console.log("Login failed: Invalid email or password for", email);
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error("Error during login:", error);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  // Signup function: creates a new user if email is not already in use
  const signup = (name: string, email: string, password: string): boolean => {
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const existingUser = users.find((u: any) => u.email === email);

      if (existingUser) {
        console.log("Signup failed: Email already in use:", email);
        return false; // Email already in use
      }

      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9), // Basic unique ID
        name,
        email,
        preferences: {
          darkMode: false,
          preferredTransportMode: "car",
          language: "en"
        },
        savedDestinations: [],
        savedItineraries: [],
        // In a real app, password should be hashed and stored securely
        password: password,
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem("users", JSON.stringify(updatedUsers));

      setUser(newUser);
      setIsAuthenticated(true);
      console.log("New user signed up:", newUser.email);
      return true;
    } catch (error) {
      console.error("Error during signup:", error);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  // Logout function: clears user state and localStorage
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    console.log("User logged out");
  };

  // Update user preferences
  const updatePreferences = (preferences: Partial<User['preferences']>) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      preferences: {
        ...user.preferences,
        ...preferences
      }
    };
    setUser(updatedUser);
    // The useEffect hook will save the updated user to localStorage
    console.log("User preferences updated:", updatedUser.preferences);
  };

  // Save a destination to the user's saved destinations
  const saveDestination = (destinationId: string) => {
    if (!user) return;

    const updatedSavedDestinations = user.savedDestinations?.includes(destinationId)
      ? user.savedDestinations // Destination already saved
      : [...(user.savedDestinations || []), destinationId]; // Add new destination

    const updatedUser = {
      ...user,
      savedDestinations: updatedSavedDestinations
    };
    setUser(updatedUser);
    // The useEffect hook will save the updated user to localStorage
    console.log(`Destination ${destinationId} saved for user ${user.email}`);
  };

  // Remove a saved destination
  const removeSavedDestination = (destinationId: string) => {
    if (!user || !user.savedDestinations) return;

    const updatedSavedDestinations = user.savedDestinations.filter(id => id !== destinationId);

    const updatedUser = {
      ...user,
      savedDestinations: updatedSavedDestinations
    };
    setUser(updatedUser);
    // The useEffect hook will save the updated user to localStorage
    console.log(`Destination ${destinationId} removed for user ${user.email}`);
  };

  // Save an itinerary
  const saveItinerary = (itinerary: any) => {
    if (!user) return;

    const updatedSavedItineraries = user.savedItineraries?.some(i => i.id === itinerary.id)
      ? user.savedItineraries.map(i => i.id === itinerary.id ? itinerary : i)
      : [...(user.savedItineraries || []), itinerary];

    const updatedUser = {
      ...user,
      savedItineraries: updatedSavedItineraries
    };
    setUser(updatedUser);
    // The useEffect hook will save the updated user to localStorage
    console.log(`Itinerary ${itinerary.id} saved/updated for user ${user.email}`);
  };

  // Remove a saved itinerary
  const removeSavedItinerary = (itineraryId: string) => {
    if (!user || !user.savedItineraries) return;

    const updatedSavedItineraries = user.savedItineraries.filter(i => i.id !== itineraryId);

    const updatedUser = {
      ...user,
      savedItineraries: updatedSavedItineraries
    };
    setUser(updatedUser);
    // The useEffect hook will save the updated user to localStorage
    console.log(`Itinerary ${itineraryId} removed for user ${user.email}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
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
